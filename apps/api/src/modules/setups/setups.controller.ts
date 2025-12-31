import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SetupsService } from './setups.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/auth.types';

@Controller('setups')
@UseGuards(JwtAuthGuard)
export class SetupsController {
  constructor(private readonly setupsService: SetupsService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() createSetupDto: CreateSetupDto) {
    return this.setupsService.create(req.user.id, createSetupDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.setupsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.setupsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateSetupDto: UpdateSetupDto,
  ) {
    return this.setupsService.update(req.user.id, id, updateSetupDto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.setupsService.remove(req.user.id, id);
  }
}
