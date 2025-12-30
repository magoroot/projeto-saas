import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsString({ each: true })
  @IsOptional()
  indicators?: string[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
