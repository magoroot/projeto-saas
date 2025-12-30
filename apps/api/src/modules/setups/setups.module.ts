import { Module } from '@nestjs/common';
import { SetupsController } from './setups.controller';

@Module({
  controllers: [SetupsController],
})
export class SetupsModule {}
