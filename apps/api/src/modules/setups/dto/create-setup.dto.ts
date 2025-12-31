import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SetupIndicatorDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsOptional()
  params?: Record<string, unknown>;
}

export class CreateSetupDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @IsString()
  @IsNotEmpty()
  timeframe!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SetupIndicatorDto)
  indicators!: SetupIndicatorDto[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
