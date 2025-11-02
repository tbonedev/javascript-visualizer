import { Injectable } from '@nestjs/common';
import * as asyncHooks from 'async_hooks';
import {
  EventLoopState,
  AsyncEvent,
} from '../interfaces/async-event.interface';
import { EventLoopStateManager } from './async-hooks/state/event-loop-state.manager';
import { EventStore } from './async-hooks/state/event-store';
import { PromiseHandler } from './async-hooks/handlers/promise.handler';
import { TimeoutHandler } from './async-hooks/handlers/timeout.handler';
import { MicrotaskHandler } from './async-hooks/handlers/microtask.handler';
import { IGNORED_ASYNC_TYPES } from './async-hooks/constants/ignored-async-types';

/**
 * Main service for tracking async operations using Node.js async_hooks API
 */
@Injectable()
export class AsyncHooksService {
  private hook: asyncHooks.AsyncHook | null = null;

  constructor(
    private readonly stateManager: EventLoopStateManager,
    private readonly eventStore: EventStore,
    private readonly promiseHandler: PromiseHandler,
    private readonly timeoutHandler: TimeoutHandler,
    private readonly microtaskHandler: MicrotaskHandler,
  ) {}

  /**
   * Enable async hooks tracking
   */
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

  /**
   * Disable async hooks tracking
   */
  disable(): void {
    if (this.hook) {
      this.hook.disable();
      this.hook = null;
      console.log('✅ Async hooks disabled');
    }
  }

  /**
   * Reset all tracking state
   */
  reset(): void {
    this.stateManager.reset();
    this.eventStore.clear();
    this.promiseHandler.reset();
    this.timeoutHandler.reset();
    this.microtaskHandler.reset();
  }

  /**
   * Get current Event Loop state
   */
  getEventLoopState(): EventLoopState {
    return this.stateManager.getState();
  }

  /**
   * Get all recorded events
   */
  getEvents(): AsyncEvent[] {
    return this.eventStore.getAll();
  }

  // ========== Async Hooks Callbacks ==========

  /**
   * Called when async resource is created
   */
  private onInit(
    asyncId: number,
    type: string,
    triggerAsyncId: number,
    resource: any,
  ): void {
    // Filter out system/internal async resources
    if (IGNORED_ASYNC_TYPES.includes(type as any)) {
      return;
    }

    // Store resource for later inspection
    this.stateManager.setResource(asyncId, resource);

    // Delegate to specific handlers
    if (type === 'PROMISE') {
      this.promiseHandler.onInit(asyncId, triggerAsyncId);
    } else if (type === 'Timeout') {
      this.timeoutHandler.onInit(asyncId, resource);
    } else if (type === 'Microtask') {
      this.microtaskHandler.onInit(asyncId, triggerAsyncId);
    }
  }

  /**
   * Called before async callback execution
   */
  private onBefore(asyncId: number): void {
    const resource = this.stateManager.getResource(asyncId);
    if (!resource) return;

    const resourceName = resource.constructor?.name;

    // Delegate to specific handlers based on resource type
    if (resourceName === 'PromiseWrap') {
      this.promiseHandler.onBefore(asyncId);
    } else if (resourceName === 'Timeout') {
      this.timeoutHandler.onBefore(asyncId);
    } else if (resourceName === 'AsyncResource') {
      this.microtaskHandler.onBefore(asyncId);
    }
  }

  /**
   * Called after async callback execution
   */
  private onAfter(asyncId: number): void {
    const resource = this.stateManager.getResource(asyncId);
    if (!resource) return;

    const resourceName = resource.constructor?.name;

    // Delegate to specific handlers based on resource type
    if (resourceName === 'PromiseWrap') {
      this.promiseHandler.onAfter(asyncId);
    } else if (resourceName === 'Timeout') {
      this.timeoutHandler.onAfter(asyncId);
    } else if (resourceName === 'AsyncResource') {
      this.microtaskHandler.onAfter(asyncId);
    }
  }

  /**
   * Called when async resource is destroyed
   */
  private onDestroy(asyncId: number): void {
    const resource = this.stateManager.getResource(asyncId);
    if (!resource) return;

    const resourceName = resource.constructor?.name;

    // Delegate to specific handlers based on resource type
    if (resourceName === 'PromiseWrap') {
      this.promiseHandler.onDestroy(asyncId);
    } else if (resourceName === 'Timeout') {
      this.timeoutHandler.onDestroy(asyncId);
    } else if (resourceName === 'AsyncResource') {
      this.microtaskHandler.onDestroy(asyncId);
    }

    // Clean up resource storage
    this.stateManager.deleteResource(asyncId);
  }

  /**
   * Called when Promise is resolved
   */
  private onPromiseResolve(asyncId: number): void {
    this.promiseHandler.onResolve(asyncId);
  }
}
