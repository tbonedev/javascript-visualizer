import { Module } from '@nestjs/common';
import { ExecutorModule } from './executor/executor.module';
import { CoordinatorModule } from './coordinator/coordinator.module';

@Module({
  imports: [ExecutorModule, CoordinatorModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
