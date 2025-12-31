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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let SetupsService = class SetupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
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
                indicators,
                isDefault: data.isDefault ?? false,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.userSetup.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const setup = await this.prisma.userSetup.findFirst({
            where: { id, userId },
        });
        if (!setup) {
            throw new common_1.NotFoundException('Setup not found');
        }
        return setup;
    }
    async update(userId, id, data) {
        const existing = await this.prisma.userSetup.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Setup not found');
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
                indicators,
                isDefault: data.isDefault,
            },
        });
    }
    async remove(userId, id) {
        const existing = await this.prisma.userSetup.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Setup not found');
        }
        await this.prisma.userSetup.delete({ where: { id } });
        return { deleted: true };
    }
    async validateIndicatorsAllowed(userId, indicators) {
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
            throw new common_1.BadRequestException('Active subscription is required');
        }
        const plan = subscription.plan;
        const allowedIndicatorCodes = new Set(plan.planIndicators.map((item) => item.indicator.code));
        const activeIndicators = indicators.filter((indicator) => indicator.enabled !== false);
        const requested = Array.from(new Set(activeIndicators.map((indicator) => indicator.code)));
        if (requested.length > plan.maxIndicatorsActive) {
            throw new common_1.BadRequestException(`Indicator limit exceeded for plan ${plan.name}`);
        }
        const notAllowed = requested.filter((code) => !allowedIndicatorCodes.has(code));
        if (notAllowed.length > 0) {
            throw new common_1.BadRequestException(`Indicators not allowed for plan ${plan.name}: ${notAllowed.join(', ')}`);
        }
    }
    normalizeIndicators(indicators) {
        if (indicators.length === 0) {
            return [];
        }
        if (typeof indicators[0] === 'string') {
            return indicators.map((code) => ({
                code: code.toUpperCase(),
                enabled: true,
                params: {},
            }));
        }
        return indicators.map((indicator) => ({
            code: indicator.code.toUpperCase(),
            enabled: indicator.enabled ?? true,
            params: indicator.params ?? {},
        }));
    }
};
exports.SetupsService = SetupsService;
exports.SetupsService = SetupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SetupsService);
//# sourceMappingURL=setups.service.js.map