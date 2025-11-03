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

// 🎯 Source location где создан callback
export interface CallbackSource {
  line: number;
  code: string; // строка кода где создан callback
}

// 🎯 Closure для callback - захваченные переменные
export interface CallbackClosure {
  [key: string]: any;
}

export interface PromiseItem {
  id: number;
  parentId: number;
  status: 'pending' | 'resolved' | 'rejected';
  callbackName?: string;
  // 🎯 NEW: closure и source
  closure?: CallbackClosure;
  source?: CallbackSource;
}

export interface TimeoutItem {
  id: number;
  callbackName: string;
  delay?: number;
  createdAt: number;
  // 🎯 NEW: closure и source
  closure?: CallbackClosure;
  source?: CallbackSource;
}

export interface MicrotaskItem {
  id: number;
  parentId: number;
  callbackName?: string;
  // 🎯 NEW: closure и source
  closure?: CallbackClosure;
  source?: CallbackSource;
}

export interface EventLoopState {
  webAPIs: {
    promises: PromiseItem[];
    timeouts: TimeoutItem[];
  };
  microtaskQueue: MicrotaskItem[];
  taskQueue: TimeoutItem[];
}
