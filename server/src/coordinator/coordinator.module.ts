import { Module } from '@nestjs/common';
import { CoordinatorService } from './coordinator.service';
import { CoordinatorController } from './coordinator.controller';
import { ExecutorModule } from '../executor/executor.module';

@Module({
  imports: [ExecutorModule],
  controllers: [CoordinatorController],
  providers: [CoordinatorService],
})
export class CoordinatorModule {}
