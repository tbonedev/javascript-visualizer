import { Module } from '@nestjs/common';
import { ExecutorService } from './executor.service';

@Module({
  exports: [ExecutorService],
  providers: [ExecutorService],
})
export class ExecutorModule {}
