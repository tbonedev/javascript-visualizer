import { ExecutionStep } from '../../executor/executor.interfaces';

export interface ExecutionResult {
  success: boolean;
  trace: ExecutionStep[];
  originalCode: string;
  totalSteps?: number;
}
