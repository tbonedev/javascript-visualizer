import { Injectable } from '@nestjs/common';
import { EventLoopStateManager } from '../state/event-loop-state.manager';
import { EventStore } from '../state/event-store';

/**
 * Handles Timeout/Interval lifecycle events
 */
@Injectable()
export class TimeoutHandler {
  constructor(
    private readonly stateManager: EventLoopStateManager,
    private readonly eventStore: EventStore,
  ) {}

  /**
   * Called when setTimeout/setInterval is created
   */
  onInit(asyncId: number, resource: any): void {
    const callbackName = resource._onTimeout?.name || 'anonymous';
    const delay = resource._idleTimeout;

    this.stateManager.addTimeout(asyncId, callbackName, delay);

    this.eventStore.add({
      type: 'InitTimeout',
      asyncId,
      callbackName,
      timestamp: Date.now(),
    });
  }

  /**
   * Called before timeout callback execution
   */
  onBefore(asyncId: number): void {
    this.eventStore.add({
      type: 'BeforeTimeout',
      asyncId,
      timestamp: Date.now(),
    });

    // Remove from task queue when execution starts
    this.stateManager.removeFromTaskQueue(asyncId);
  }

  /**
   * Called after timeout callback execution
   */
  onAfter(asyncId: number): void {
    this.eventStore.add({
      type: 'AfterTimeout',
      asyncId,
      timestamp: Date.now(),
    });
  }

  /**
   * Called when timeout is destroyed
   */
  onDestroy(asyncId: number): void {
    this.stateManager.deleteTimeout(asyncId);
  }

  /**
   * Reset handler state
   */
  reset(): void {
    // No internal state to reset
  }
}
