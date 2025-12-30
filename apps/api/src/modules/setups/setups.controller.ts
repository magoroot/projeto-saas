import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SetupsService } from './setups.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';

@Controller('setups')
export class SetupsController {
  constructor(private readonly setupsService: SetupsService) {}

  @Post()
  create(
    @Headers('x-user-id') userId: string | undefined,
    @Body() createSetupDto: CreateSetupDto,
  ) {
    return this.setupsService.create(userId, createSetupDto);
  }

  @Get()
  findAll(@Headers('x-user-id') userId: string | undefined) {
    return this.setupsService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.setupsService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
    @Body() updateSetupDto: UpdateSetupDto,
  ) {
    return this.setupsService.update(userId, id, updateSetupDto);
  }

  @Delete(':id')
  remove(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.setupsService.remove(userId, id);
  }
}
