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

  async run(code: string): Promise<void> {
    const codeLines = code.split('\n');
    const pausePromises: Promise<void>[] = []; // ← Сохраняем все Promise

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Execution timeout'));
      }, this.TIMEOUT);

      // Регистрируем listener для паузы на breakpoints
      this.v8Inspector.on<inspector.Debugger.PausedEventDataType>(
        'Debugger.paused',
        (message) => {
          // Сохраняем Promise от handlePause
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

      // Запускаем код (синхронно, но breakpoints будут обрабатываться)
      try {
        console.log('✅ Code execution started');
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
            console.log('✅ Code execution completed');
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
