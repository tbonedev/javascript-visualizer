import { StackFrame } from './stack-frame.interface';

export interface ExecutionStep {
  step: number;
  line: number;
  code: string;
  variables: Record<string, unknown>;

  callStack?: StackFrame[];
  // heap?: HeapObject[];
}
