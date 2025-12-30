import { Module } from '@nestjs/common';
import { IndicatorsController } from './indicators.controller';

@Module({
  controllers: [IndicatorsController],
})
export class IndicatorsModule {}
