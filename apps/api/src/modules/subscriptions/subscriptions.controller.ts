import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/auth.types';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('active')
  @UseGuards(JwtAuthGuard)
  getActive(@Req() req: AuthenticatedRequest) {
    return this.subscriptionsService.getActive(req.user.id);
  }

  @Post('select')
  @UseGuards(JwtAuthGuard)
  selectPlan(@Req() req: AuthenticatedRequest, @Body('planId') planId: string) {
    return this.subscriptionsService.selectPlan(req.user.id, planId);
  }
}
