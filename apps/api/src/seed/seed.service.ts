import { Injectable, Logger } from '@nestjs/common';
import { Market, Prisma, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ensureSeed() {
    const planCount = await this.prisma.plan.count();
    const indicatorCount = await this.prisma.indicator.count();

    if (planCount > 0 && indicatorCount > 0) {
      this.logger.log('Seed already present. Skipping bootstrap.');
      await this.ensureDefaultAdmin();
      return;
    }

    this.logger.log('Seeding plans and indicators...');

    const indicatorSeeds: Prisma.IndicatorCreateInput[] = [
      {
        code: 'MA',
        name: 'Moving Average',
        description: 'Média móvel simples/exp.',
        category: 'Trend',
        isPremium: false,
        defaultParams: { period: 20, type: 'SMA' },
        userParamsEditable: true,
        isActive: true,
      },
      {
        code: 'RSI',
        name: 'Relative Strength Index',
        description: 'Força relativa e sobrecompra/sobrevenda.',
        category: 'Momentum',
        isPremium: false,
        defaultParams: { period: 14 },
        userParamsEditable: true,
        isActive: true,
      },
      {
        code: 'MACD',
        name: 'MACD',
        description: 'Convergência/divergência de médias.',
        category: 'Momentum',
        isPremium: true,
        defaultParams: { fast: 12, slow: 26, signal: 9 },
        userParamsEditable: true,
        isActive: true,
      },
    ];

    if (indicatorCount === 0) {
      this.logger.log('Creating indicator catalog...');
      for (const indicator of indicatorSeeds) {
        await this.prisma.indicator.upsert({
          where: { code: indicator.code },
          update: indicator,
          create: indicator,
        });
      }
    }

    const planSeeds: Prisma.PlanCreateInput[] = [
      {
        name: 'Starter',
        description: 'Plano essencial para análises básicas.',
        price: new Prisma.Decimal(49),
        currency: 'BRL',
        maxIndicatorsActive: 2,
        allowedMarkets: [Market.FOREX, Market.CRYPTO],
        isActive: true,
      },
      {
        name: 'Pro',
        description: 'Indicadores avançados para traders ativos.',
        price: new Prisma.Decimal(129),
        currency: 'BRL',
        maxIndicatorsActive: 4,
        allowedMarkets: [Market.FOREX, Market.CRYPTO, Market.INDICES],
        isActive: true,
      },
      {
        name: 'Prime',
        description: 'Acesso total e indicadores proprietários.',
        price: new Prisma.Decimal(249),
        currency: 'BRL',
        maxIndicatorsActive: 6,
        allowedMarkets: [Market.FOREX, Market.CRYPTO, Market.INDICES],
        isActive: true,
      },
    ];

    if (planCount === 0) {
      this.logger.log('Creating plans...');
      for (const plan of planSeeds) {
        await this.prisma.plan.upsert({
          where: { name: plan.name },
          update: plan,
          create: plan,
        });
      }
    }

    const planIndicatorCount = await this.prisma.planIndicator.count();
    if (planIndicatorCount === 0) {
      this.logger.log('Mapping plan indicators...');
      const plans = await this.prisma.plan.findMany();
      const indicators = await this.prisma.indicator.findMany();
      const indicatorMap = new Map(
        indicators.map((item) => [item.code, item.id]),
      );

      const planIndicatorMap: Record<string, string[]> = {
        Starter: ['MA', 'RSI'],
        Pro: ['MA', 'RSI', 'MACD'],
        Prime: ['MA', 'RSI', 'MACD'],
      };

      for (const plan of plans) {
        const allowed = planIndicatorMap[plan.name] ?? [];
        if (allowed.length > 0) {
          await this.prisma.planIndicator.createMany({
            data: allowed
              .map((code) => indicatorMap.get(code))
              .filter(Boolean)
              .map((indicatorId) => ({
                planId: plan.id,
                indicatorId: indicatorId as string,
              })),
            skipDuplicates: true,
          });
        }
      }
    }

    this.logger.log('Seed completed.');
    await this.ensureDefaultAdmin();
  }

  async reseed() {
    this.logger.warn('Reseeding requested. Clearing existing data...');
    await this.prisma.planIndicator.deleteMany();
    await this.prisma.plan.deleteMany();
    await this.prisma.indicator.deleteMany();
    await this.ensureSeed();
  }

  private async ensureDefaultAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword) {
      this.logger.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set; skipping admin seed.');
      return;
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await this.prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    const starterPlan = await this.prisma.plan.findFirst({
      where: { name: 'Starter' },
      orderBy: { createdAt: 'asc' },
    });

    if (starterPlan) {
      await this.prisma.subscription.create({
        data: {
          userId: admin.id,
          planId: starterPlan.id,
          status: 'ACTIVE',
          startedAt: new Date(),
        },
      });
    }
  }
}
