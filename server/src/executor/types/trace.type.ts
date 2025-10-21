import { ExecutionStep } from '../interfaces/execution-step.interface';

export interface TraceData {
  step: ExecutionStep[];
  totalSteps: number;
}
