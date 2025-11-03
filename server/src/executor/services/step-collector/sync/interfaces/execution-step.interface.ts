import { StackFrame } from '../../shared/interfaces/stack-frame.interface';
import { Scope } from '../../shared/interfaces/scope.interface';
import { EventLoopState } from '../../../event-loop-tracker/interfaces/event-loop-event.interface';
export interface ExecutionStep {
  step: number;
  line: number;
  code: string;
  scope: Scope;

  callStack?: StackFrame[];
  // heap?: HeapObject[];
  eventLoop?: EventLoopState;
}
