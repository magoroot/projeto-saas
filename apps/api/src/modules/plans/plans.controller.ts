import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedRequest } from '../auth/auth.types';
import { UserRole } from '@prisma/client';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Req() req: AuthenticatedRequest, @Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(req.user.id, createPlanDto);
  }

  @Get()
  findAll(
    @Query('isActive') isActive?: string,
    @Query('includeIndicators') includeIndicators?: string,
  ) {
    const parsedIsActive =
      isActive === undefined ? undefined : isActive.toLowerCase() === 'true';
    const parsedIncludeIndicators =
      includeIndicators?.toLowerCase() === 'true';
    return this.plansService.findAll(parsedIsActive, parsedIncludeIndicators);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(req.user.id, id, updatePlanDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.plansService.remove(req.user.id, id);
  }

  @Post(':id/indicators')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateIndicators(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('indicatorIds') indicatorIds: string[],
  ) {
    return this.plansService.updateIndicators(req.user.id, id, indicatorIds ?? []);
  }
}
