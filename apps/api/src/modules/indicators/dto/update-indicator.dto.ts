import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateIndicatorDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;

  @IsOptional()
  defaultParams?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  userParamsEditable?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
