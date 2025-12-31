import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

@Module({
  imports: [PrismaModule],
  providers: [SeedService],
  controllers: [SeedController],
  exports: [SeedService],
})
export class SeedModule {}
