import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
} from 'class-validator';
enum Market {
  FOREX = 'FOREX',
  INDICES = 'INDICES',
  CRYPTO = 'CRYPTO',
}

export class UpdatePlanDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @IsOptional()
  price?: number;

  @IsString()
  @Length(3, 3)
  @IsOptional()
  currency?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  maxIndicatorsActive?: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Market, { each: true })
  @IsOptional()
  allowedMarkets?: Market[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
