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
import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { AuthenticatedRequest } from '../auth/auth.types';
import { UserRole } from '@prisma/client';

@Controller('indicators')
export class IndicatorsController {
  constructor(private readonly indicatorsService: IndicatorsService) {}

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const parsedIsActive =
      isActive === undefined ? undefined : isActive.toLowerCase() === 'true';
    return this.indicatorsService.findAll(parsedIsActive);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createIndicatorDto: CreateIndicatorDto,
  ) {
    return this.indicatorsService.create(req.user.id, createIndicatorDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateIndicatorDto: UpdateIndicatorDto,
  ) {
    return this.indicatorsService.update(req.user.id, id, updateIndicatorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.indicatorsService.remove(req.user.id, id);
  }
}
