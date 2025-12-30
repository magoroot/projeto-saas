import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

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
  @IsString({ each: true })
  indicators!: string[];

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
