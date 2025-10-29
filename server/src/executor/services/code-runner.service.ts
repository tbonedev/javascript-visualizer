import { Injectable } from '@nestjs/common';
import vm from 'vm';
import inspector from 'inspector';
import { V8InspectorService } from './v8-inspector.service';
import { StepCollectorService } from './step-collector/step-collector.service';
import { createSafeContext } from './vm-context';

@Injectable()
export class CodeRunnerService {
  private readonly VIRTUAL_FILENAME = 'virtual://code.js';
  private readonly TIMEOUT = 150000;

  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly stepCollector: StepCollectorService,
  ) {}

  async runWithBreakpoints(code: string): Promise<void> {
    const codeLines = code.split('\n');
    const pausePromises: Promise<void>[] = [];

    return new Promise(async (resolve, reject) => {
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

      try {
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
            console.log(
              `⏳ Waiting for ${pausePromises.length} pause handlers to complete...`,
            );
            await Promise.all(pausePromises);
            clearTimeout(timeout);
            console.log('✅ Code execution completed (breakpoints + stepOver mode)');
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
        this.v8Inspector.post('Debugger.setPauseOnNextStatement', {}).then(() => {
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
              reject(error instanceof Error ? error : new Error(String(error)));
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

              console.log(
                `✅ Set ${breakpointCount} breakpoints via scriptId`,
              );
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
              reject(
                error instanceof Error ? error : new Error(String(error)),
              );
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
