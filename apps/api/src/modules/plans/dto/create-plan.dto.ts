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
import { Market } from '@prisma/client';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @IsString()
  @Length(3, 3)
  currency: string;

  @IsInt()
  @IsPositive()
  maxIndicatorsActive: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Market, { each: true })
  allowedMarkets: Market[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
