import { ExecutionStep } from 'src/executor/interfaces/execution-step.interface';

export interface ExecutionResult {
  success: boolean;
  trace: ExecutionStep[];
  originalCode: string;
  totalSteps?: number;
}
