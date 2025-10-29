import { Injectable } from '@nestjs/common';
import { ExecuteInputDto } from './dto/execute-input.dto';
import { ExecutionResult } from './types/execution-result';
import { ExecutorService } from '../executor/executor.service';
@Injectable()
export class CoordinatorService {
  constructor(private readonly executorService: ExecutorService) {}

  async execute(dto: ExecuteInputDto): Promise<ExecutionResult> {
    //validate input

    const trace = await this.executorService.execute(dto.code);

    console.log('📤 Sending response to frontend:');
    console.log('   totalSteps:', trace.length);
    console.log('   Sample step (step 1):', JSON.stringify(trace[1], null, 2));

    return {
      success: true,
      trace,
      originalCode: dto.code,
      totalSteps: trace.length,
    };
  }
}
