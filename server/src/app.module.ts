import { Module } from '@nestjs/common';
import { TracingModule } from './tracing/tracing.module';
import { ExecutorModule } from './executor/executor.module';

@Module({
  imports: [TracingModule, ExecutorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
