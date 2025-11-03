import { Injectable } from '@nestjs/common';
import * as asyncHooks from 'async_hooks';
import {
  EventLoopState,
  AsyncEvent,
} from './interfaces/event-loop-event.interface';
import { EventLoopStateManager } from './state/event-loop-state.manager';
import { EventStore } from './state/event-store';
import { PromiseHandler } from './handlers/promise.handler';
import { TimeoutHandler } from './handlers/timeout.handler';
import { MicrotaskHandler } from './handlers/microtask.handler';
import { IGNORED_ASYNC_TYPES } from './constants/ignored-async-types';

/**
 * Service for tracking Event Loop state and async operations using Node.js async_hooks API
 */
@Injectable()
export class EventLoopTrackerService {
  private hook: asyncHooks.AsyncHook | null = null;
  private isTrackingUserCode: boolean = false; // Track only user code operations
  private pendingClosures = new Map<
    number,
    { closure: any; source: { line: number; code: string } }
  >();
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
   * Start tracking user code operations (called on first breakpoint)
   */
  startTrackingUserCode(): void {
    this.isTrackingUserCode = true;
    console.log('🎯 Started tracking user code operations');
  }

  /**
   * Reset all tracking state
   */
  reset(): void {
    this.isTrackingUserCode = false;
    this.pendingClosures.clear();
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
  /**
   * Register closure for async operation at specific line
   * Called when we pause on async operation line (setTimeout, Promise.then, etc)
   */
  registerClosureForLine(lineNumber: number, closure: any, code: string): void {
    console.log(
      `🎯 Registering closure for line ${lineNumber}: ${Object.keys(closure).join(', ')}`,
    );

    const source = { line: lineNumber, code };

    const timeouts = Array.from(this.stateManager['timeouts'].values());

    if (timeouts.length > 0) {
      const latestTimeout = timeouts[timeouts.length - 1];
      if (!latestTimeout.closure) {
        latestTimeout.closure = closure;
        latestTimeout.source = source;
        console.log(`  ✅ Attached closure to timeout ${latestTimeout.id}`);
        return;
      }
    }
    // Find most recently created promise (highest asyncId)
    const promises = Array.from(this.stateManager['promises'].values());
    if (promises.length > 0) {
      const latestPromise = promises[promises.length - 1];
      if (!latestPromise.closure) {
        latestPromise.closure = closure;
        latestPromise.source = source;
        console.log(`  ✅ Attached closure to promise ${latestPromise.id}`);
        return;
      }
    }

    console.log(`  ⚠️  No async operation found to attach closure`);
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

    // 🎯 Only track operations created DURING user code execution
    if (!this.isTrackingUserCode) {
      return;
    }

    // Store resource for later inspection
    this.stateManager.setResource(asyncId, resource);

    // Delegate to specific handlers WITHOUT closure (closure will be attached later via registerClosureForLine)
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
