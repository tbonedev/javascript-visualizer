import { Module } from '@nestjs/common';
import { ExecutorService } from './executor.service';
import {
  V8InspectorService,
  BreakpointService,
  CodeRunnerService,
  StepCollectorService,
} from './services';

@Module({
  providers: [
    ExecutorService,
    V8InspectorService,
    BreakpointService,
    CodeRunnerService,
    StepCollectorService,
  ],
  exports: [ExecutorService],
})
export class ExecutorModule {}
