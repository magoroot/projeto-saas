import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actorUserId: string | undefined, data: CreatePlanDto) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const plan = await this.prisma.plan.create({
      data: {
        ...data,
      },
    });

    await this.logAudit(ensuredActorId, 'plan.create', plan.id, {
      created: plan,
    });

    return plan;
  }

  async findAll(isActive?: boolean, includeIndicators = false) {
    return this.prisma.plan.findMany({
      where: isActive === undefined ? undefined : { isActive },
      orderBy: { createdAt: 'desc' },
      include: includeIndicators
        ? {
            planIndicators: {
              include: { indicator: true },
            },
          }
        : undefined,
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async update(actorUserId: string | undefined, id: string, data: UpdatePlanDto) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Plan not found');
    }

    const updated = await this.prisma.plan.update({
      where: { id },
      data,
    });

    await this.logAudit(ensuredActorId, 'plan.update', id, {
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(actorUserId: string | undefined, id: string) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Plan not found');
    }

    await this.prisma.plan.delete({ where: { id } });

    await this.logAudit(ensuredActorId, 'plan.delete', id, {
      deleted: existing,
    });

    return { deleted: true };
  }

  async updateIndicators(
    actorUserId: string | undefined,
    planId: string,
    indicatorIds: string[],
  ) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    await this.prisma.planIndicator.deleteMany({ where: { planId } });
    if (indicatorIds.length > 0) {
      await this.prisma.planIndicator.createMany({
        data: indicatorIds.map((indicatorId) => ({ planId, indicatorId })),
        skipDuplicates: true,
      });
    }

    await this.logAudit(ensuredActorId, 'plan.indicators.update', planId, {
      indicatorIds,
    });

    return this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        planIndicators: {
          include: { indicator: true },
        },
      },
    });
  }

  private ensureActor(actorUserId: string | undefined): string {
    if (!actorUserId) {
      throw new BadRequestException('Missing x-actor-user-id header');
    }
    return actorUserId;
  }

  private async logAudit(
    actorUserId: string,
    action: string,
    targetId: string,
    metadata: any,
  ) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId,
        action,
        targetType: 'Plan',
        targetId,
        metadata,
      },
    });
  }
}
