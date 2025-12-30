import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(
    @Headers('x-actor-user-id') actorUserId: string | undefined,
    @Body() createPlanDto: CreatePlanDto,
  ) {
    return this.plansService.create(actorUserId, createPlanDto);
  }

  @Get()
  findAll(@Query('isActive') isActive?: string) {
    const parsedIsActive =
      isActive === undefined ? undefined : isActive.toLowerCase() === 'true';
    return this.plansService.findAll(parsedIsActive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Headers('x-actor-user-id') actorUserId: string | undefined,
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.plansService.update(actorUserId, id, updatePlanDto);
  }

  @Delete(':id')
  remove(
    @Headers('x-actor-user-id') actorUserId: string | undefined,
    @Param('id') id: string,
  ) {
    return this.plansService.remove(actorUserId, id);
  }
}
