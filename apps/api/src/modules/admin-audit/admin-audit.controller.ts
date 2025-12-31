import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAuditService } from './admin-audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/audit')
export class AdminAuditController {
  constructor(private readonly auditService: AdminAuditService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.auditService.findAll();
  }
}
