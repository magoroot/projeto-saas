import { Controller, Get } from '@nestjs/common';

@Controller('setups')
export class SetupsController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      scope: 'setups',
      note: 'User chart setups are managed here.',
    };
  }
}
