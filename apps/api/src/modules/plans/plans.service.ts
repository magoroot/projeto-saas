import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(actorUserId: string | undefined, data: CreatePlanDto) {
    this.ensureActor(actorUserId);
    const plan = await this.prisma.plan.create({
      data: {
        ...data,
      },
    });

    await this.logAudit(actorUserId, 'plan.create', plan.id, {
      created: plan,
    });

    return plan;
  }

  async findAll(isActive?: boolean) {
    return this.prisma.plan.findMany({
      where: isActive === undefined ? undefined : { isActive },
      orderBy: { createdAt: 'desc' },
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
    this.ensureActor(actorUserId);
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Plan not found');
    }

    const updated = await this.prisma.plan.update({
      where: { id },
      data,
    });

    await this.logAudit(actorUserId, 'plan.update', id, {
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(actorUserId: string | undefined, id: string) {
    this.ensureActor(actorUserId);
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Plan not found');
    }

    await this.prisma.plan.delete({ where: { id } });

    await this.logAudit(actorUserId, 'plan.delete', id, {
      deleted: existing,
    });

    return { deleted: true };
  }

  private ensureActor(actorUserId: string | undefined) {
    if (!actorUserId) {
      throw new BadRequestException('Missing x-actor-user-id header');
    }
  }

  private async logAudit(
    actorUserId: string,
    action: string,
    targetId: string,
    metadata: Record<string, unknown>,
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
