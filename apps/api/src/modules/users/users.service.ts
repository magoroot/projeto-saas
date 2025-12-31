import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
            OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
          },
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: { plan: true },
        },
      },
    });
  }

  async updateStatus(
    actorUserId: string | undefined,
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED',
  ) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await this.logAudit(ensuredActorId, 'user.status.update', userId, {
      before: user,
      after: updated,
    });

    return updated;
  }

  async changePlan(
    actorUserId: string | undefined,
    userId: string,
    planId: string,
  ) {
    const ensuredActorId = this.ensureActor(actorUserId);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    await this.prisma.subscription.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      data: { status: 'CANCELED', endsAt: new Date() },
    });

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });

    await this.logAudit(ensuredActorId, 'user.plan.update', userId, {
      planId,
      subscriptionId: subscription.id,
    });

    return subscription;
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
        targetType: 'User',
        targetId,
        metadata,
      },
    });
  }
}
