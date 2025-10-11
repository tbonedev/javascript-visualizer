import { Module } from '@nestjs/common';
import { TracingController } from './tracing.controller';
import { TracingService } from './tracing.service';

@Module({
  controllers: [TracingController],
  providers: [TracingService],
})
export class TracingModule {}
