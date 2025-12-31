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

export class UpdateSetupDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  symbol?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  timeframe?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SetupIndicatorDto)
  @IsOptional()
  indicators?: SetupIndicatorDto[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
