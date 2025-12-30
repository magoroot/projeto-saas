import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      scope: 'users',
      note: 'User authentication and profile management will live here.',
    };
  }
}
