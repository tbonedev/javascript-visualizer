import { Injectable } from '@nestjs/common';
import {
  EventLoopState,
  PromiseItem,
  TimeoutItem,
  MicrotaskItem,
} from '../interfaces/event-loop-event.interface';

/**
 * Manages Event Loop state: Web APIs, queues, and async resources
 */
@Injectable()
export class EventLoopStateManager {
  // Storage for async resources
  private asyncIdToResource = new Map<number, any>();
  private promises = new Map<number, PromiseItem>();
  private timeouts = new Map<number, TimeoutItem>();
  private microtasks = new Map<number, MicrotaskItem>();

  // Queues
  private microtaskQueue: MicrotaskItem[] = [];
  private taskQueue: TimeoutItem[] = [];

  /**
   * Get current Event Loop state snapshot
   */
  getState(): EventLoopState {
    // Filter out internal/system promises (those without closure/source)
    // Only show user code promises that have been tracked
    const userPromises = Array.from(this.promises.values()).filter(
      (p) => p.closure || p.source,
    );

    // Filter out internal/system microtasks too
    const userMicrotasks = this.microtaskQueue.filter(
      (m) => m.closure || m.source,
    );

    return {
      webAPIs: {
        promises: userPromises,
        timeouts: Array.from(this.timeouts.values()),
      },
      microtaskQueue: userMicrotasks,
      taskQueue: [...this.taskQueue],
    };
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.asyncIdToResource.clear();
    this.promises.clear();
    this.timeouts.clear();
    this.microtasks.clear();
    this.microtaskQueue = [];
    this.taskQueue = [];
  }

  // ========== Resource Management ==========

  setResource(asyncId: number, resource: any): void {
    this.asyncIdToResource.set(asyncId, resource);
  }

  getResource(asyncId: number): any | undefined {
    return this.asyncIdToResource.get(asyncId);
  }

  deleteResource(asyncId: number): void {
    this.asyncIdToResource.delete(asyncId);
  }

  // ========== Promise Management ==========

  addPromise(
    asyncId: number,
    parentId: number,
    closure?: any,
    source?: { line: number; code: string },
  ): void {
    const promiseItem: PromiseItem = {
      id: asyncId,
      parentId,
      status: 'pending',
      closure,
      source,
    };
    this.promises.set(asyncId, promiseItem);
  }

  getPromise(asyncId: number): PromiseItem | undefined {
    return this.promises.get(asyncId);
  }

  updatePromiseStatus(
    asyncId: number,
    status: 'pending' | 'resolved' | 'rejected',
  ): void {
    const promise = this.promises.get(asyncId);
    if (promise) {
      promise.status = status;
    }
  }

  deletePromise(asyncId: number): void {
    this.promises.delete(asyncId);
  }

  findChildPromise(parentId: number): PromiseItem | undefined {
    return Array.from(this.promises.values()).find(
      (p) => p.parentId === parentId,
    );
  }

  // ========== Timeout Management ==========

  addTimeout(
    asyncId: number,
    callbackName: string,
    delay?: number,
    closure?: any,
    source?: { line: number; code: string },
  ): void {
    const timeoutItem: TimeoutItem = {
      id: asyncId,
      callbackName,
      delay,
      createdAt: Date.now(),
      closure,
      source,
    };
    this.timeouts.set(asyncId, timeoutItem);
  }

  getTimeout(asyncId: number): TimeoutItem | undefined {
    return this.timeouts.get(asyncId);
  }

  deleteTimeout(asyncId: number): void {
    this.timeouts.delete(asyncId);
  }

  // ========== Microtask Management ==========

  addMicrotask(
    asyncId: number,
    parentId: number,
    closure?: any,
    source?: { line: number; code: string },
  ): void {
    const microtaskItem: MicrotaskItem = {
      id: asyncId,
      parentId,
      closure,
      source,
    };
    this.microtasks.set(asyncId, microtaskItem);
  }

  getMicrotask(asyncId: number): MicrotaskItem | undefined {
    return this.microtasks.get(asyncId);
  }

  deleteMicrotask(asyncId: number): void {
    this.microtasks.delete(asyncId);
  }

  // ========== Queue Management ==========

  pushToMicrotaskQueue(microtask: MicrotaskItem): void {
    this.microtaskQueue.push(microtask);
  }

  removeFromMicrotaskQueue(asyncId: number): void {
    this.microtaskQueue = this.microtaskQueue.filter((m) => m.id !== asyncId);
  }

  pushToTaskQueue(task: TimeoutItem): void {
    this.taskQueue.push(task);
  }

  removeFromTaskQueue(asyncId: number): void {
    this.taskQueue = this.taskQueue.filter((t) => t.id !== asyncId);
  }
}
