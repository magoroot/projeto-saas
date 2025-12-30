import { Controller, Get } from '@nestjs/common';

@Controller('admin/audit')
export class AdminAuditController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      scope: 'admin-audit',
      note: 'Administrative audit trails are tracked here.',
    };
  }
}
