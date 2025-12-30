import { Controller, Get } from '@nestjs/common';

@Controller('indicators')
export class IndicatorsController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      scope: 'indicators',
      note: 'Indicator catalog and plan access live here.',
    };
  }
}
