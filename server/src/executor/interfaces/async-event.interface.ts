export type AsyncEventType =
  // Promise события
  | 'InitPromise' // Promise создан
  | 'ResolvePromise' // Promise resolved
  | 'BeforePromise' // Promise callback начал выполняться
  | 'AfterPromise' // Promise callback закончил выполнение
  // setTimeout события
  | 'InitTimeout' // setTimeout зарегистрирован
  | 'BeforeTimeout' // setTimeout callback начал выполняться
  | 'AfterTimeout' // setTimeout callback закончил выполнение
  // Microtask события (queueMicrotask)
  | 'InitMicrotask'
  | 'BeforeMicrotask'
  | 'AfterMicrotask';

export interface AsyncEvent {
  type: AsyncEventType;
  asyncId: number;
  triggerAsyncId?: number;
  callbackName?: string;
  timestamp: number;
}

export interface PromiseItem {
  id: number;
  parentId: number;
  status: 'pending' | 'resolved' | 'rejected';
  callbackName?: string;
}

export interface TimeoutItem {
  id: number;
  callbackName: string;
  delay?: number;
  createdAt: number;
}

export interface MicrotaskItem {
  id: number;
  parentId: number;
  callbackName?: string;
}

export interface EventLoopState {
  webAPIs: {
    promises: PromiseItem[];
    timeouts: TimeoutItem[];
  };
  microtaskQueue: MicrotaskItem[];
  taskQueue: TimeoutItem[];
}
