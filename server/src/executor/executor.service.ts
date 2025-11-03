import { Injectable } from '@nestjs/common';
import { ExecutionStep } from './executor.interfaces';
import { V8InspectorService } from './services';
import { RuntimeService } from './services/runtime/runtime.service';
import { StepCollectorService } from './services/step-collector/sync/step-collector.service';
import { AsyncStepCollectorService } from './services/step-collector/async/async-step-collector.service';
import { UserFunctionParserService } from './services/step-collector/shared/user-function-parser.service';

@Injectable()
export class ExecutorService {
  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly stepCollector: StepCollectorService,
    private readonly asyncStepCollector: AsyncStepCollectorService,
    private readonly runtime: RuntimeService,
    private readonly userFunctionParser: UserFunctionParserService,
  ) {}

  /**
   * Execute code and return execution trace (Hybrid mode)
   *
   * Режим 1: Sync Code - пошаговое выполнение с scope/callstack
   * Режим 2: Event Loop - визуализация очередей (без выполнения callbacks)
   */
  async execute(code: string): Promise<ExecutionStep[]> {
    try {
      // Парсим пользовательские функции перед выполнением
      this.userFunctionParser.parseCode(code);

      await this.v8Inspector.connect();

      // Выполняем ТОЛЬКО sync код с breakpoints
      // Event Loop Tracker работает в фоне и отслеживает состояние
      await this.runtime.runWithBreakpoints(code);

      // Возвращаем ТОЛЬКО sync steps
      // Каждый step содержит eventLoop snapshot
      const steps = this.stepCollector.getSteps();

      console.log(`📊 Total steps: ${steps.length} (sync only, with Event Loop snapshots)`);

      return steps;
    } finally {
      this.v8Inspector.disconnect();
      this.stepCollector.reset();
      this.asyncStepCollector.reset();
      this.userFunctionParser.reset();
    }
  }
}
