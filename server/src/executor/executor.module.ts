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
} from './services';
import { UserFunctionParserService } from './services/step-collector/user-function-parser.service';

@Module({
  providers: [
    ExecutorService,

    // Core services
    V8InspectorService,
    BreakpointService,
    CodeRunnerService,

    // Step collector
    StepCollectorService,
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
  ],
  exports: [ExecutorService],
})
export class ExecutorModule {}
