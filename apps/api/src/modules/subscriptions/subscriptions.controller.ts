import { Controller, Get } from '@nestjs/common';

@Controller('subscriptions')
export class SubscriptionsController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      scope: 'subscriptions',
      note: 'User subscriptions will be orchestrated here.',
    };
  }
}
