import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async selectPlan(userId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
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

    return this.prisma.subscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        startedAt: new Date(),
      },
    });
  }

  async getActive(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });

    if (!subscription) {
      throw new BadRequestException('No active subscription');
    }

    return subscription;
  }
}
