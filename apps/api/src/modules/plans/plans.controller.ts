import { Controller, Get } from '@nestjs/common';

@Controller('plans')
export class PlansController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      scope: 'plans',
      note: 'Subscription plans and entitlements are managed here.',
    };
  }
}
