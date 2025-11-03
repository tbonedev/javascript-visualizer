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
   * Execute code and return execution trace
   */
  async execute(code: string): Promise<ExecutionStep[]> {
    try {
      // Парсим пользовательские функции перед выполнением
      this.userFunctionParser.parseCode(code);

      await this.v8Inspector.connect();

      // Используем runWithBreakpoints - устанавливаем breakpoints и используем stepOver
      await this.runtime.runWithBreakpoints(code);

      // Об'єднуємо sync і async steps
      const syncSteps = this.stepCollector.getSteps();
      const asyncSteps = this.asyncStepCollector.getAsyncSteps();

      console.log(`📊 Total steps: ${syncSteps.length} sync + ${asyncSteps.length} async = ${syncSteps.length + asyncSteps.length}`);

      // Async steps вже мають правильну нумерацію (продовження після sync)
      // Просто об'єднуємо масиви
      return [...syncSteps, ...asyncSteps];
    } finally {
      this.v8Inspector.disconnect();
      this.stepCollector.reset();
      this.asyncStepCollector.reset();
      this.userFunctionParser.reset();
    }
  }
}
