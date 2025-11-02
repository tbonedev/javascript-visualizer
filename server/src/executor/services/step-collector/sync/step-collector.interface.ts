import inspector from 'inspector';
import { ExecutionStep } from './execution-step.interface';

export interface IStepCollectorService {
  handlePause(
    params: inspector.Debugger.PausedEventDataType,
    codeLines: string[],
  ): Promise<void>;
  getSteps(): ExecutionStep[];
  reset(): void;
}
