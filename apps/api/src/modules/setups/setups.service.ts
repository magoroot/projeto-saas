import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';

type SetupIndicatorInput = {
  code: string;
  enabled?: boolean;
  params?: Record<string, unknown>;
};

@Injectable()
export class SetupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateSetupDto) {
    const indicators = this.normalizeIndicators(data.indicators);
    await this.validateIndicatorsAllowed(userId, indicators);

    if (data.isDefault) {
      await this.prisma.userSetup.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.userSetup.create({
      data: {
        userId,
        name: data.name,
        symbol: data.symbol,
        timeframe: data.timeframe,
        indicators: indicators as unknown as any,
        isDefault: data.isDefault ?? false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.userSetup.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const setup = await this.prisma.userSetup.findFirst({
      where: { id, userId },
    });
    if (!setup) {
      throw new NotFoundException('Setup not found');
    }
    return setup;
  }

  async update(userId: string, id: string, data: UpdateSetupDto) {
    const existing = await this.prisma.userSetup.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Setup not found');
    }

    const indicators = data.indicators
      ? this.normalizeIndicators(data.indicators)
      : undefined;

    if (indicators) {
      await this.validateIndicatorsAllowed(userId, indicators);
    }

    if (data.isDefault) {
      await this.prisma.userSetup.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return this.prisma.userSetup.update({
      where: { id },
      data: {
        name: data.name,
        symbol: data.symbol,
        timeframe: data.timeframe,
        indicators: indicators as unknown as any,
        isDefault: data.isDefault,
      },
    });
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.userSetup.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('Setup not found');
    }

    await this.prisma.userSetup.delete({ where: { id } });
    return { deleted: true };
  }

  private async validateIndicatorsAllowed(
    userId: string,
    indicators: SetupIndicatorInput[],
  ) {
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
      plan.planIndicators.map(
        (item: { indicator: { code: string } }) => item.indicator.code,
      ),
    );
    const activeIndicators = indicators.filter(
      (indicator) => indicator.enabled !== false,
    );
    const requested = Array.from(
      new Set(activeIndicators.map((indicator) => indicator.code)),
    );

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

  private normalizeIndicators(
    indicators: Array<SetupIndicatorInput> | string[],
  ): SetupIndicatorInput[] {
    if (indicators.length === 0) {
      return [];
    }

    if (typeof indicators[0] === 'string') {
    return (indicators as string[]).map((code) => ({
      code: code.toUpperCase(),
      enabled: true,
      params: {},
    }));
  }

  return (indicators as SetupIndicatorInput[]).map((indicator) => ({
      code: indicator.code.toUpperCase(),
      enabled: indicator.enabled ?? true,
      params: indicator.params ?? {},
    }));
  }
}
