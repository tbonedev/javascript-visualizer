import { Module } from '@nestjs/common';
import { ExecutorService } from './executor.service';
import {
  V8InspectorService,
  BreakpointService,
  RuntimeService,
  StepCollectorService,
  ScopeExtractorService,
  VariableSerializerService,
  CircularGuard,
  PropertyFilter,
  ValueSerializer,
  ArraySerializer,
  ObjectSerializer,
  EventLoopTrackerService,
} from './services';
import { UserFunctionParserService } from './services/step-collector/shared/user-function-parser.service';
import { AsyncStepCollectorService } from './services/step-collector/async/async-step-collector.service';
import { MicrotaskHandler } from './services/event-loop-tracker/handlers/microtask.handler';
import { PromiseHandler } from './services/event-loop-tracker/handlers/promise.handler';
import { TimeoutHandler } from './services/event-loop-tracker/handlers/timeout.handler';
import { EventLoopStateManager } from './services/event-loop-tracker/state/event-loop-state.manager';
import { EventStore } from './services/event-loop-tracker/state/event-store';

@Module({
  providers: [
    ExecutorService,

    // Core services
    V8InspectorService,
    BreakpointService,
    RuntimeService,

    // Step collector
    StepCollectorService,
    AsyncStepCollectorService,
    ScopeExtractorService,
    UserFunctionParserService,

    // Variable serializer
    VariableSerializerService,

    // Helpers
    CircularGuard,
    PropertyFilter,

    // Serializers
    ValueSerializer,
    ArraySerializer,
    ObjectSerializer,

    // Event Loop Tracker
    EventLoopTrackerService,
    // Event Loop Tracker - State Management
    EventLoopStateManager,
    EventStore,

    // Event Loop Tracker - Handlers
    PromiseHandler,
    TimeoutHandler,
    MicrotaskHandler,
  ],
  exports: [ExecutorService],
})
export class ExecutorModule {}
