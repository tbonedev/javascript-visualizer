import { StackFrame } from '../shared/stack-frame.interface';
import { Scope } from '../shared/scope.interface';
import { EventLoopState } from '../../async-hooks/async-event.interface';
export interface ExecutionStep {
  step: number;
  line: number;
  code: string;
  scope: Scope;

  callStack?: StackFrame[];
  // heap?: HeapObject[];
  eventLoop?: EventLoopState;
}
