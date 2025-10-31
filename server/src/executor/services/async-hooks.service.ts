import { Injectable } from '@nestjs/common';
import {
  AsyncEvent,
  PromiseItem,
  TimeoutItem,
  MicrotaskItem,
  EventLoopState,
} from '../interfaces/async-event.interface';
import * as asyncHooks from 'async_hooks';
@Injectable()
export class AsyncHooksService {
  private hook: asyncHooks.AsyncHook | null = null;
  private events: AsyncEvent[] = [];

  // Хранилище async ресурсов
  private asyncIdToResource = new Map<number, any>();
  private promises = new Map<number, PromiseItem>();
  private timeouts = new Map<number, TimeoutItem>();
  private microtasks = new Map<number, MicrotaskItem>();

  // queues
  private microtaskQueue: MicrotaskItem[] = [];
  private taskQueue: TimeoutItem[] = [];

  enable(): void {
    if (this.hook) {
      console.warn('⚠️ Async hooks already enabled');
      return;
    }

    this.hook = asyncHooks.createHook({
      init: this.onInit.bind(this),
      before: this.onBefore.bind(this),
      after: this.onAfter.bind(this),
      destroy: this.onDestroy.bind(this),
      promiseResolve: this.onPromiseResolve.bind(this),
    });

    this.hook.enable();
    console.log('✅ Async hooks enabled');
  }

  disable(): void {
    if (this.hook) {
      this.hook.disable();
      this.hook = null;
      console.log('✅ Async hooks disabled');
    }
  }
  reset(): void {
    this.events = [];
    this.asyncIdToResource.clear();
    this.promises.clear();
    this.timeouts.clear();
    this.microtasks.clear();
    this.microtaskQueue = [];
    this.taskQueue = [];
  }

  getEventLoopState(): EventLoopState {
    return {
      webAPIs: {
        promises: Array.from(this.promises.values()),
        timeouts: Array.from(this.timeouts.values()),
      },
      microtaskQueue: [...this.microtaskQueue],
      taskQueue: [...this.taskQueue],
    };
  }
  getEvents(): AsyncEvent[] {
    return [...this.events];
  }
  // ========== Async Hooks callbacks ==========
  private onInit(
    asyncId: number,
    type: string,
    triggerAsyncId: number,
    resource: any,
  ): void {
    this.asyncIdToResource.set(asyncId, resource);

    if (type === 'PROMISE') {
      const promiseItem: PromiseItem = {
        id: asyncId,
        parentId: triggerAsyncId,
        status: 'pending',
      };
      this.promises.set(asyncId, promiseItem);

      this.addEvent({
        type: 'InitPromise',
        asyncId,
        triggerAsyncId,
        timestamp: Date.now(),
      });
    }
    if (type === 'Timeout') {
      const callbackName = resource._onTimeout?.name || 'anonymous';
      const timeoutItem: TimeoutItem = {
        id: asyncId,
        callbackName,
        createdAt: Date.now(),
      };
      this.timeouts.set(asyncId, timeoutItem);

      this.addEvent({
        type: 'InitTimeout',
        asyncId,
        callbackName,
        timestamp: Date.now(),
      });
    }

    // Обрабатываем Microtask (queueMicrotask)
    if (type === 'Microtask') {
      const microtaskItem: MicrotaskItem = {
        id: asyncId,
        parentId: triggerAsyncId,
      };
      this.microtasks.set(asyncId, microtaskItem);

      this.addEvent({
        type: 'InitMicrotask',
        asyncId,
        triggerAsyncId,
        timestamp: Date.now(),
      });
    }
  }
  private onBefore(asyncId: number): void {
    const resource = this.asyncIdToResource.get(asyncId);
    if (!resource) return;
    const resourceName = resource.constructor?.name;

    if (resourceName === 'PromiseWrap') {
      this.addEvent({
        type: 'BeforePromise',
        asyncId,
        timestamp: Date.now(),
      });
      this.microtaskQueue = this.microtaskQueue.filter((m) => m.id !== asyncId);
    }
    if (resourceName === 'Timeout') {
      this.addEvent({
        type: 'BeforeTimeout',
        asyncId,
        timestamp: Date.now(),
      });
      this.taskQueue = this.taskQueue.filter((t) => t.id !== asyncId);
    }

    // Microtask callback начал выполняться
    if (resourceName === 'AsyncResource') {
      this.addEvent({
        type: 'BeforeMicrotask',
        asyncId,
        timestamp: Date.now(),
      });

      this.microtaskQueue = this.microtaskQueue.filter((m) => m.id !== asyncId);
    }
  }

  /**
   * Вызывается ПОСЛЕ выполнения async callback
   */
  private onAfter(asyncId: number): void {
    const resource = this.asyncIdToResource.get(asyncId);
    if (!resource) return;

    const resourceName = resource.constructor?.name;

    if (resourceName === 'PromiseWrap') {
      this.addEvent({
        type: 'AfterPromise',
        asyncId,
        timestamp: Date.now(),
      });
    }

    if (resourceName === 'Timeout') {
      this.addEvent({
        type: 'AfterTimeout',
        asyncId,
        timestamp: Date.now(),
      });
    }

    if (resourceName === 'AsyncResource') {
      this.addEvent({
        type: 'AfterMicrotask',
        asyncId,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Вызывается когда async ресурс уничтожается
   */
  private onDestroy(asyncId: number): void {
    // Удаляем из хранилища
    this.asyncIdToResource.delete(asyncId);
    this.promises.delete(asyncId);
    this.timeouts.delete(asyncId);
    this.microtasks.delete(asyncId);
  }

  /**
   * Вызывается когда Promise resolve-ится
   */
  private onPromiseResolve(asyncId: number): void {
    const promise = this.promises.get(asyncId);
    if (promise) {
      promise.status = 'resolved';

      this.addEvent({
        type: 'ResolvePromise',
        asyncId,
        timestamp: Date.now(),
      });

      // Promise resolved → callback идет в microtask queue
      // Находим дочерний Promise (который создан .then())
      const childPromise = Array.from(this.promises.values()).find(
        (p) => p.parentId === asyncId,
      );

      if (childPromise) {
        const microtask: MicrotaskItem = {
          id: childPromise.id,
          parentId: asyncId,
          callbackName: childPromise.callbackName,
        };
        this.microtaskQueue.push(microtask);
      }
    }
  }

  /**
   * Добавить событие в список
   */
  private addEvent(event: AsyncEvent): void {
    this.events.push(event);
  }
}
