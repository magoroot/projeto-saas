"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let SeedService = SeedService_1 = class SeedService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SeedService_1.name);
    }
    async ensureSeed() {
        const planCount = await this.prisma.plan.count();
        const indicatorCount = await this.prisma.indicator.count();
        if (planCount > 0 && indicatorCount > 0) {
            this.logger.log('Seed already present. Skipping bootstrap.');
            await this.ensureDefaultAdmin();
            return;
        }
        this.logger.log('Seeding plans and indicators...');
        const indicatorSeeds = [
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
        const planSeeds = [
            {
                name: 'Starter',
                description: 'Plano essencial para análises básicas.',
                price: 49,
                currency: 'BRL',
                maxIndicatorsActive: 2,
                allowedMarkets: ['FOREX', 'CRYPTO'],
                isActive: true,
            },
            {
                name: 'Pro',
                description: 'Indicadores avançados para traders ativos.',
                price: 129,
                currency: 'BRL',
                maxIndicatorsActive: 4,
                allowedMarkets: ['FOREX', 'CRYPTO', 'INDICES'],
                isActive: true,
            },
            {
                name: 'Prime',
                description: 'Acesso total e indicadores proprietários.',
                price: 249,
                currency: 'BRL',
                maxIndicatorsActive: 6,
                allowedMarkets: ['FOREX', 'CRYPTO', 'INDICES'],
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
            const indicatorMap = new Map(indicators.map((item) => [item.code, item.id]));
            const planIndicatorMap = {
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
                            indicatorId: indicatorId,
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
    async ensureDefaultAdmin() {
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
                role: 'ADMIN',
                status: 'ACTIVE',
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
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeedService);
//# sourceMappingURL=seed.service.js.map