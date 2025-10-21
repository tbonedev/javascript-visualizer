import { Body, Controller, Post } from '@nestjs/common';
import { ExecuteInputDto } from './dto/execute-input.dto';
import { ExecutionResult } from './types/execution-result';
import { CoordinatorService } from './coordinator.service';

@Controller('coordinator')
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Post('execute')
  async execute(@Body() dto: ExecuteInputDto): Promise<ExecutionResult> {
    return await this.coordinatorService.execute(dto);
  }
}
