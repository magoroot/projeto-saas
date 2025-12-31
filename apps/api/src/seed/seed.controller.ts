import { Controller, Post, UseGuards } from '@nestjs/common';
import { SeedService } from './seed.service';
import { JwtAuthGuard } from '../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/roles.guard';
import { Roles } from '../modules/auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('reseed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  reseed() {
    return this.seedService.reseed();
  }
}
