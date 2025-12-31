import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';

@Injectable()
export class IndicatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actorUserId: string | undefined, data: CreateIndicatorDto) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const indicator = await this.prisma.indicator.create({
      data: {
        code: data.code.toUpperCase(),
        name: data.name,
        description: data.description,
        category: data.category,
        isPremium: data.isPremium ?? false,
        defaultParams: data.defaultParams ?? {},
        userParamsEditable: data.userParamsEditable ?? true,
        isActive: data.isActive ?? true,
      },
    });

    await this.logAudit(ensuredActorId, 'indicator.create', indicator.id, {
      created: indicator,
    });

    return indicator;
  }

  async findAll(isActive?: boolean) {
    return this.prisma.indicator.findMany({
      where: isActive === undefined ? undefined : { isActive },
      orderBy: { name: 'asc' },
    });
  }

  async update(
    actorUserId: string | undefined,
    id: string,
    data: UpdateIndicatorDto,
  ) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const existing = await this.prisma.indicator.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Indicator not found');
    }

    const updated = await this.prisma.indicator.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
        defaultParams: data.defaultParams as Prisma.InputJsonValue | undefined,
      },
    });

    await this.logAudit(ensuredActorId, 'indicator.update', id, {
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(actorUserId: string | undefined, id: string) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const existing = await this.prisma.indicator.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Indicator not found');
    }

    await this.prisma.indicator.delete({ where: { id } });
    await this.logAudit(ensuredActorId, 'indicator.delete', id, {
      deleted: existing,
    });
    return { deleted: true };
  }

  private ensureActor(actorUserId: string | undefined): string {
    if (!actorUserId) {
      throw new BadRequestException('Missing actor user');
    }
    return actorUserId;
  }

  private async logAudit(
    actorUserId: string,
    action: string,
    targetId: string,
    metadata: Prisma.InputJsonValue,
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId,
        action,
        targetType: 'Indicator',
        targetId,
        metadata,
      },
    });
  }
}
