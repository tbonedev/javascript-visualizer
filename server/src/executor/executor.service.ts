import { Injectable } from '@nestjs/common';
import { ExecutionStep } from './interfaces/execution-step.interface';
import { V8InspectorService, BreakpointService } from './services';
import { CodeRunnerService } from './services/code-runner.service';
import { StepCollectorService } from './services/step-collector.service';

@Injectable()
export class ExecutorService {
  constructor(
    private readonly v8Inspector: V8InspectorService,
    private readonly stepCollector: StepCollectorService,
    private readonly codeRunner: CodeRunnerService,
    private readonly breakpoints: BreakpointService,
  ) {}

  /**
   * Execute code and return execution trace
   */
  async execute(code: string): Promise<ExecutionStep[]> {
    try {
      await this.v8Inspector.connect();

      await this.breakpoints.setBreakpoints(code);

      await this.codeRunner.run(code);

      return this.stepCollector.getSteps();
    } finally {
      this.v8Inspector.disconnect();
      this.stepCollector.reset();
    }
  }
}
