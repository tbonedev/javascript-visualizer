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
    return {
      success: true,
      trace,
      originalCode: dto.code,
      totalSteps: trace.length,
    };
  }
}
