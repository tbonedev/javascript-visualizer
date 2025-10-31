import { StackFrame } from './stack-frame.interface';
import { Scope } from './scope.interface';
import { EventLoopState } from './async-event.interface';
export interface ExecutionStep {
  step: number;
  line: number;
  code: string;
  scope: Scope;

  callStack?: StackFrame[];
  // heap?: HeapObject[];
  eventLoop?: EventLoopState;
}
