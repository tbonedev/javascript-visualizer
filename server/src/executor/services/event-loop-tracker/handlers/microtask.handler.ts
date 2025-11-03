import { Injectable } from '@nestjs/common';
import { EventLoopStateManager } from '../state/event-loop-state.manager';
import { EventStore } from '../state/event-store';

/**
 * Handles queueMicrotask lifecycle events
 */
@Injectable()
export class MicrotaskHandler {
  constructor(
    private readonly stateManager: EventLoopStateManager,
    private readonly eventStore: EventStore,
  ) {}

  /**
   * Called when queueMicrotask is created
   */
  onInit(asyncId: number, triggerAsyncId: number): void {
    this.stateManager.addMicrotask(asyncId, triggerAsyncId);

    this.eventStore.add({
      type: 'InitMicrotask',
      asyncId,
      triggerAsyncId,
      timestamp: Date.now(),
    });
  }

  /**
   * Called before microtask callback execution
   */
  onBefore(asyncId: number): void {
    this.eventStore.add({
      type: 'BeforeMicrotask',
      asyncId,
      timestamp: Date.now(),
    });

    // Remove from microtask queue when execution starts
    this.stateManager.removeFromMicrotaskQueue(asyncId);
  }

  /**
   * Called after microtask callback execution
   */
  onAfter(asyncId: number): void {
    this.eventStore.add({
      type: 'AfterMicrotask',
      asyncId,
      timestamp: Date.now(),
    });
  }

  /**
   * Called when microtask is destroyed
   */
  onDestroy(asyncId: number): void {
    this.stateManager.deleteMicrotask(asyncId);
  }

  /**
   * Reset handler state
   */
  reset(): void {
    // No internal state to reset
  }
}
