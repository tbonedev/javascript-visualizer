import { Injectable } from '@nestjs/common';
import { EventLoopStateManager } from '../state/event-loop-state.manager';
import { EventStore } from '../state/event-store';

/**
 * Handles Promise lifecycle events
 */
@Injectable()
export class PromiseHandler {
  constructor(
    private readonly stateManager: EventLoopStateManager,
    private readonly eventStore: EventStore,
  ) {}

  /**
   * Reset tracking state
   */
  reset(): void {
    // Nothing to reset anymore
  }

  /**
   * Called when a Promise is created
   */
  onInit(
    asyncId: number,
    parentId: number,
    closure?: any,
    source?: { line: number; code: string },
  ): void {
    this.stateManager.addPromise(asyncId, parentId, closure, source);
    this.eventStore.add({
      type: 'InitPromise',
      asyncId,
      triggerAsyncId: parentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Called when a Promise is resolved
   */
  onResolve(asyncId: number): void {
    const promise = this.stateManager.getPromise(asyncId);
    if (!promise) return;

    this.stateManager.updatePromiseStatus(asyncId, 'resolved');

    this.eventStore.add({
      type: 'ResolvePromise',
      asyncId,
      timestamp: Date.now(),
    });

    // When Promise resolves, its .then() callback goes to microtask queue
    // Find child Promise (created by .then())
    const childPromise = this.stateManager.findChildPromise(asyncId);

    if (childPromise) {
      this.stateManager.pushToMicrotaskQueue({
        id: childPromise.id,
        parentId: asyncId,
        callbackName: childPromise.callbackName,
        closure: childPromise.closure,
        source: childPromise.source,
      });
    }
  }

  /**
   * Called before Promise callback execution
   */
  onBefore(asyncId: number): void {
    this.eventStore.add({
      type: 'BeforePromise',
      asyncId,
      timestamp: Date.now(),
    });

    // NOTE: In Hybrid mode, we DON'T remove from queue
    // Because callbacks execute outside our control (before first breakpoint)
    // We want to show what WOULD be in the queue for visualization
    // this.stateManager.removeFromMicrotaskQueue(asyncId);
  }

  /**
   * Called after Promise callback execution
   */
  onAfter(asyncId: number): void {
    this.eventStore.add({
      type: 'AfterPromise',
      asyncId,
      timestamp: Date.now(),
    });
  }

  /**
   * Called when Promise is destroyed
   */
  onDestroy(asyncId: number): void {
    this.stateManager.deletePromise(asyncId);
  }
}
