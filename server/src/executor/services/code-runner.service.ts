import { Injectable } from '@nestjs/common';
import vm from 'vm';
import inspector from 'inspector';
import { V8InspectorService } from './v8-inspector.service';
import { StepCollectorService } from './step-collector/step-collector.service';
import { AsyncStepCollectorService } from './step-collector/async-step-collector.service';
import { AsyncHooksService } from './async-hooks.service';
import { PromiseHandler } from './async-hooks/handlers/promise.handler';
import { createSafeContext } from './vm-context';

@Injectable()
export class CodeRunnerService {
  private readonly VIRTUAL_FILENAME = 'virtual://code.js';
  private readonly TIMEOUT = 150000;

  // Flag: чи ми зараз виконуємо sync код чи async callback
  private isExecutingAsync = false;

  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly stepCollector: StepCollectorService,
    private readonly asyncStepCollector: AsyncStepCollectorService,
    private readonly asyncHooks: AsyncHooksService,
    private readonly promiseHandler: PromiseHandler,
  ) {}

  async runWithBreakpoints(code: string): Promise<void> {
    const codeLines = code.split('\n');
    const syncPausePromises: Promise<void>[] = [];
    const asyncPausePromises: Promise<void>[] = [];

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, this.TIMEOUT);

      // Регистрируем listener для паузы
      this.v8Inspector.on<inspector.Debugger.PausedEventDataType>(
        'Debugger.paused',
        (message) => {
          // Визначаємо чи це async callback по кількості call frames
          // Async callbacks (microtasks, timeouts) мають менше frames в стеку
          const isAsyncCallback =
            this.isExecutingAsync ||
            (message.params.callFrames && message.params.callFrames.length < 4);

          // Перенаправляємо паузу в правильний collector
          if (isAsyncCallback) {
            const pausePromise = this.asyncStepCollector
              .handleAsyncPause(message.params, codeLines)
              .catch((error) => {
                clearTimeout(timeout);
                reject(error instanceof Error ? error : new Error(String(error)));
              });
            asyncPausePromises.push(pausePromise);
          } else {
            const pausePromise = this.stepCollector
              .handlePause(message.params, codeLines)
              .catch((error) => {
                clearTimeout(timeout);
                reject(error instanceof Error ? error : new Error(String(error)));
              });
            syncPausePromises.push(pausePromise);
          }
        },
      );

      try {
        this.asyncHooks.enable();
        this.isExecutingAsync = false; // Починаємо з sync коду

        // Активируем breakpoints
        await this.v8Inspector.post('Debugger.setBreakpointsActive', {
          active: true,
        });

        // Устанавливаем breakpoints на каждую строку
        console.log('🔧 Setting breakpoints on all lines...');
        for (let i = 0; i < codeLines.length; i++) {
          const line = codeLines[i].trim();
          if (line.length === 0 || line.startsWith('//')) {
            continue;
          }

          try {
            await this.v8Inspector.post('Debugger.setBreakpointByUrl', {
              lineNumber: i,
              url: this.VIRTUAL_FILENAME,
              columnNumber: 0,
            });
            console.log(`  ✅ Breakpoint set on line ${i}: "${line}"`);
          } catch (error) {
            console.log(`  ⚠️  Failed to set breakpoint on line ${i}:`, error);
          }
        }

        // Создаём безопасный контекст VM
        const context = vm.createContext(createSafeContext());

        // Компилируем скрипт
        const script = new vm.Script(code, {
          filename: this.VIRTUAL_FILENAME,
        });

        console.log('✅ Code execution started (breakpoints + stepOver mode)');

        script.runInContext(context, {
          timeout: this.TIMEOUT,
        });

        // ЖДЁМ завершения ВСЕХ handlePause перед resolve
        setImmediate(async () => {
          try {
            // Wait for all SYNC pause handlers first
            console.log(
              `⏳ Waiting for ${syncPausePromises.length} SYNC pause handlers to complete...`,
            );
            await Promise.all(syncPausePromises);
            console.log('✅ All SYNC steps collected');

            // Регіструємо async операції з sync коду
            this.registerAsyncOperationsFromSteps(codeLines);

            // Встановлюємо початковий лічильник для async steps
            const syncStepCount = this.stepCollector.getSteps().length;
            this.asyncStepCollector.setInitialStepCounter(syncStepCount);

            // 🔥 CREATE ASYNC STEPS MANUALLY FOR PROMISE CALLBACKS
            // Debugger cannot catch Promise callbacks reliably, so we create steps manually
            console.log('ℹ️  Creating async steps for Promise callbacks manually...');
            await this.createAsyncStepsForPromises(codeLines);

            // Check if there are pending async operations
            const eventLoopState = this.asyncHooks.getEventLoopState();

            // Filter only user timeouts (not internal Node.js/NestJS timeouts)
            const MAX_REASONABLE_TIMEOUT = 10000; // 10 seconds
            const userTimeouts = eventLoopState.webAPIs.timeouts.filter(
              (t) => (t.delay || 0) <= MAX_REASONABLE_TIMEOUT,
            );

            const hasPendingTimeouts = userTimeouts.length > 0;
            const hasPendingPromises = eventLoopState.webAPIs.promises.some(
              (p) => p.status === 'pending',
            );

            console.log(`📊 Event Loop State:`, {
              userTimeouts: userTimeouts.length,
              totalTimeouts: eventLoopState.webAPIs.timeouts.length,
              pendingPromises: eventLoopState.webAPIs.promises.filter(
                (p) => p.status === 'pending',
              ).length,
            });

            if (hasPendingTimeouts || hasPendingPromises) {
              console.log('⏳ Waiting for async operations to complete...');

              // Переключаємо на async режим ОДРАЗУ
              this.isExecutingAsync = true;

              // Знаходимо максимальний delay серед user timeouts
              const maxDelay = userTimeouts.length > 0
                ? Math.max(...userTimeouts.map((t) => t.delay || 0))
                : 0;

              // Якщо є тільки promises (microtasks), чекаємо мінімум
              // Якщо є timeouts, чекаємо їх delay
              const waitTime = maxDelay > 0 ? maxDelay + 500 : 100;

              console.log(
                `⏰ ${maxDelay > 0 ? `Timeout delay: ${maxDelay}ms` : 'Microtasks only'}, waiting ${waitTime}ms for callbacks...`,
              );

              // Чекаємо поки виконаються callbacks
              await new Promise((r) => setTimeout(r, waitTime));

              // Wait for async operations with timeout
              const startTime = Date.now();
              const maxWaitTime = this.TIMEOUT;

              while (Date.now() - startTime < maxWaitTime) {
                await new Promise((r) => setTimeout(r, 50)); // Poll every 50ms

                // Process any new ASYNC pause handlers that appeared
                if (asyncPausePromises.length > 0) {
                  console.log(
                    `⏳ Processing ${asyncPausePromises.length} ASYNC pause handlers from callbacks...`,
                  );
                  const currentPauses = [...asyncPausePromises];
                  asyncPausePromises.length = 0; // Clear array
                  await Promise.all(currentPauses);
                  console.log('✅ ASYNC callback pauses processed');
                }

                // Check if we're truly done (no new pauses appearing for 200ms)
                const beforeWait = asyncPausePromises.length;
                await new Promise((r) => setTimeout(r, 200));
                const afterWait = asyncPausePromises.length;

                if (beforeWait === 0 && afterWait === 0) {
                  console.log('✅ No more async operations detected');
                  break;
                }
              }

              if (Date.now() - startTime >= maxWaitTime) {
                console.log('⏱️  Async operations timeout reached');
              }
            } else {
              this.asyncHooks.disable();
            }

            clearTimeout(timeout);
            console.log(
              '✅ Code execution completed (breakpoints + stepOver mode)',
            );
            resolve();
          } catch (error) {
            this.asyncHooks.disable();
            clearTimeout(timeout);
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        this.asyncHooks.disable();

        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Сканує зібрані sync steps і реєструє async операції
   */
  private registerAsyncOperationsFromSteps(codeLines: string[]): void {
    for (let i = 0; i < codeLines.length; i++) {
      const code = codeLines[i];
      const asyncCheck = this.asyncStepCollector.isAsyncLine(code);

      if (asyncCheck.isAsync && asyncCheck.type) {
        this.asyncStepCollector.registerAsyncOperation(
          i,
          code.trim(),
          asyncCheck.type,
        );
        console.log(
          `📋 Registered async line ${i}: ${asyncCheck.type} - "${code.trim()}"`,
        );
      }
    }
  }

  /**
   * Створює async steps для Promise callbacks вручну (якщо debugger їх не спіймав)
   */
  private async createAsyncStepsForPromises(codeLines: string[]): Promise<void> {
    // Get all registered async operations that are Promise-related
    for (let i = 0; i < codeLines.length; i++) {
      const code = codeLines[i];
      const asyncCheck = this.asyncStepCollector.isAsyncLine(code);

      if (
        asyncCheck.isAsync &&
        (asyncCheck.type === 'Promise.then' ||
          asyncCheck.type === 'Promise.catch' ||
          asyncCheck.type === 'Promise.finally')
      ) {
        // Get the current event loop state (after callback executed)
        const eventLoopState = this.asyncHooks.getEventLoopState();

        // Get the last sync step to extract scope
        const syncSteps = this.stepCollector.getSteps();
        const lastStep = syncSteps[syncSteps.length - 1];

        // Create async step manually
        const asyncStep = {
          step: this.asyncStepCollector.getAsyncSteps().length,
          line: i,
          code: code.trim(),
          scope: lastStep ? lastStep.scope : { local: {}, closure: {}, global: {} },
          callStack: [
            {
              functionName: `${asyncCheck.type} callback`,
              line: i,
              column: 0,
            },
          ],
          eventLoop: eventLoopState,
          asyncOperation: {
            type: asyncCheck.type,
            scheduledAt: {
              line: i,
              code: code.trim(),
            },
          },
        };

        // Add the async step to collector
        this.asyncStepCollector.addAsyncStep(asyncStep as any);
        console.log(`✨ Created async step for line ${i}: ${asyncCheck.type}`);
      }
    }
  }

  async run(code: string): Promise<void> {
    const codeLines = code.split('\n');
    const pausePromises: Promise<void>[] = [];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, this.TIMEOUT);

      // Регистрируем listener для паузы
      this.v8Inspector.on<inspector.Debugger.PausedEventDataType>(
        'Debugger.paused',
        (message) => {
          const pausePromise = this.stepCollector
            .handlePause(message.params, codeLines)
            .catch((error) => {
              clearTimeout(timeout);
              reject(error instanceof Error ? error : new Error(String(error)));
            });

          pausePromises.push(pausePromise);
        },
      );

      // Создаём безопасный контекст VM
      const context = vm.createContext(createSafeContext());

      // Компилируем скрипт
      const script = new vm.Script(code, {
        filename: this.VIRTUAL_FILENAME,
      });

      // Запускаем код с начальной паузой
      try {
        console.log('✅ Code execution started (step-by-step mode)');

        // Ставим паузу перед следующей строкой кода
        this.v8Inspector
          .post('Debugger.setPauseOnNextStatement', {})
          .then(() => {
            script.runInContext(context, {
              timeout: this.TIMEOUT,
            });

            // ЖДЁМ завершения ВСЕХ handlePause перед resolve
            setImmediate(async () => {
              try {
                console.log(
                  `⏳ Waiting for ${pausePromises.length} pause handlers to complete...`,
                );
                await Promise.all(pausePromises);
                clearTimeout(timeout);
                console.log('✅ Code execution completed (step-by-step mode)');
                resolve();
              } catch (error) {
                clearTimeout(timeout);
                reject(
                  error instanceof Error ? error : new Error(String(error)),
                );
              }
            });
          });
      } catch (error) {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  async runWithScriptId(code: string): Promise<void> {
    const codeLines = code.split('\n');
    const pausePromises: Promise<void>[] = [];
    let scriptIdResolved = false;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, this.TIMEOUT);

      // 1. Подписываемся на scriptParsed чтобы получить scriptId
      this.v8Inspector.on<inspector.Debugger.ScriptParsedEventDataType>(
        'Debugger.scriptParsed',
        async (message) => {
          const params = message.params;
          console.log('📜 Script parsed:', params.url);

          // Наш виртуальный скрипт
          if (params.url === this.VIRTUAL_FILENAME && !scriptIdResolved) {
            scriptIdResolved = true;
            const scriptId = params.scriptId;
            console.log('✅ Got scriptId:', scriptId);

            // Устанавливаем breakpoints через scriptId
            try {
              const lines = code.split('\n');
              let breakpointCount = 0;

              console.log('🔧 Setting breakpoints via scriptId...');

              for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line.length === 0 || line.startsWith('//')) {
                  continue;
                }

                const result: any = await this.v8Inspector.post(
                  'Debugger.setBreakpoint',
                  {
                    location: {
                      scriptId,
                      lineNumber: i,
                      columnNumber: 0,
                    },
                  },
                );

                console.log(
                  `  ✅ Breakpoint ${i}: "${lines[i].trim()}" -> actualLocation: line ${result.actualLocation?.lineNumber}`,
                );
                breakpointCount++;
              }

              console.log(`✅ Set ${breakpointCount} breakpoints via scriptId`);
            } catch (error) {
              console.error(
                '❌ Failed to set breakpoints via scriptId:',
                error,
              );
            }
          }
        },
      );

      // 2. Подписываемся на паузы
      this.v8Inspector.on<inspector.Debugger.PausedEventDataType>(
        'Debugger.paused',
        (message) => {
          const pausePromise = this.stepCollector
            .handlePause(message.params, codeLines)
            .catch((error) => {
              clearTimeout(timeout);
              reject(error instanceof Error ? error : new Error(String(error)));
            });

          pausePromises.push(pausePromise);
        },
      );

      // 3. Создаём контекст и запускаем
      const context = vm.createContext(createSafeContext());
      const script = new vm.Script(code, {
        filename: this.VIRTUAL_FILENAME,
      });

      try {
        console.log('✅ Code execution started (scriptId approach)');
        script.runInContext(context, {
          timeout: this.TIMEOUT,
        });

        setImmediate(async () => {
          try {
            console.log(
              `⏳ Waiting for ${pausePromises.length} pause handlers to complete...`,
            );
            await Promise.all(pausePromises);
            clearTimeout(timeout);
            console.log('✅ Code execution completed (scriptId approach)');
            resolve();
          } catch (error) {
            clearTimeout(timeout);
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
}
