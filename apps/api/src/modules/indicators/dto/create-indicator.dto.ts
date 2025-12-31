import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateIndicatorDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

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
