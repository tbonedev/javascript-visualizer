import { Module } from '@nestjs/common';
import { ExecutorService } from './executor.service';
import {
  V8InspectorService,
  BreakpointService,
  CodeRunnerService,
  StepCollectorService,
  ScopeExtractorService,
  VariableSerializerService,
  CircularGuard,
  PropertyFilter,
  ValueSerializer,
  ArraySerializer,
  ObjectSerializer,
  AsyncHooksService,
} from './services';
import { UserFunctionParserService } from './services/step-collector/user-function-parser.service';
import { AsyncStepCollectorService } from './services/step-collector/async-step-collector.service';
import { MicrotaskHandler } from './services/async-hooks/handlers/microtask.handler';
import { PromiseHandler } from './services/async-hooks/handlers/promise.handler';
import { TimeoutHandler } from './services/async-hooks/handlers/timeout.handler';
import { EventLoopStateManager } from './services/async-hooks/state/event-loop-state.manager';
import { EventStore } from './services/async-hooks/state/event-store';

@Module({
  providers: [
    ExecutorService,

    // Core services
    V8InspectorService,
    BreakpointService,
    CodeRunnerService,

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

    // Async
    AsyncHooksService,
    // Async Hooks - State Management
    EventLoopStateManager,
    EventStore,

    // Async Hooks - Handlers
    PromiseHandler,
    TimeoutHandler,
    MicrotaskHandler,
  ],
  exports: [ExecutorService],
})
export class ExecutorModule {}
