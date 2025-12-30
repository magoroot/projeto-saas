import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';

@Injectable()
export class SetupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string | undefined, data: CreateSetupDto) {
    this.ensureUser(userId);
    await this.validateIndicatorsAllowed(userId, data.indicators);

    return this.prisma.userSetup.create({
      data: {
        userId,
        name: data.name,
        symbol: data.symbol,
        timeframe: data.timeframe,
        indicators: data.indicators,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async findAll(userId: string | undefined) {
    this.ensureUser(userId);
    return this.prisma.userSetup.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string | undefined, id: string) {
    this.ensureUser(userId);
    const setup = await this.prisma.userSetup.findFirst({
      where: { id, userId },
    });
    if (!setup) {
      throw new NotFoundException('Setup not found');
    }
    return setup;
  }

  async update(userId: string | undefined, id: string, data: UpdateSetupDto) {
    this.ensureUser(userId);
    const existing = await this.prisma.userSetup.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Setup not found');
    }

    if (data.indicators) {
      await this.validateIndicatorsAllowed(userId, data.indicators);
    }

    return this.prisma.userSetup.update({
      where: { id },
      data: {
        name: data.name,
        symbol: data.symbol,
        timeframe: data.timeframe,
        indicators: data.indicators,
        isDefault: data.isDefault,
      },
    });
  }

  async remove(userId: string | undefined, id: string) {
    this.ensureUser(userId);
    const existing = await this.prisma.userSetup.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Setup not found');
    }

    await this.prisma.userSetup.delete({ where: { id } });
    return { deleted: true };
  }

  private ensureUser(userId: string | undefined) {
    if (!userId) {
      throw new BadRequestException('Missing x-user-id header');
    }
  }

  private async validateIndicatorsAllowed(userId: string, indicators: string[]) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
      },
      orderBy: { startedAt: 'desc' },
      include: {
        plan: {
          include: {
            planIndicators: {
              include: { indicator: true },
            },
          },
        },
      },
    });

    if (!subscription?.plan) {
      throw new BadRequestException('Active subscription is required');
    }

    const plan = subscription.plan;
    const allowedIndicatorCodes = new Set(
      plan.planIndicators.map((item) => item.indicator.code),
    );
    const requested = Array.from(new Set(indicators));

    if (requested.length > plan.maxIndicatorsActive) {
      throw new BadRequestException(
        `Indicator limit exceeded for plan ${plan.name}`,
      );
    }

    const notAllowed = requested.filter((code) => !allowedIndicatorCodes.has(code));

    if (notAllowed.length > 0) {
      throw new BadRequestException(
        `Indicators not allowed for plan ${plan.name}: ${notAllowed.join(', ')}`,
      );
    }
  }
}
