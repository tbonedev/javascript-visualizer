import { ExecutionStep } from './execution-step.interface';
import { StackFrame } from './stack-frame.interface';

/**
 * Type of async operation
 */
export type AsyncOperationType =
  | 'setTimeout'
  | 'setInterval'
  | 'Promise.then'
  | 'Promise.catch'
  | 'Promise.finally'
  | 'async/await'
  | 'queueMicrotask'
  | 'process.nextTick'
  | 'setImmediate';

/**
 * Information about async operation
 */
export interface AsyncOperationInfo {
  type: AsyncOperationType;
  asyncId?: number; // async_hooks asyncId
  triggerAsyncId?: number; // parent asyncId
  scheduledAt: {
    line: number;
    code: string;
  };
  delay?: number; // for setTimeout/setInterval
}

/**
 * Extended execution step for async code
 * Includes information about the async operation that triggered this callback
 */
export interface AsyncExecutionStep extends ExecutionStep {
  asyncOperation: AsyncOperationInfo;
  asyncStackTrace?: StackFrame[]; // V8 Inspector async stack trace
  asyncStackTraceId?: string; // V8 Inspector async stack trace ID
}
