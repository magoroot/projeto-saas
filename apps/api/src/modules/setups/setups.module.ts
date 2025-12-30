import { Module } from '@nestjs/common';
import { SetupsController } from './setups.controller';
import { SetupsService } from './setups.service';

@Module({
  controllers: [SetupsController],
  providers: [SetupsService],
})
export class SetupsModule {}
