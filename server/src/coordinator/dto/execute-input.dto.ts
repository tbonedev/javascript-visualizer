import {
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class ExecuteInputDto {
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  code: string;

  @IsOptional()
  @IsBoolean()
  includeCallStack?: boolean;
}
