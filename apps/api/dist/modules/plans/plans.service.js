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
exports.PlansService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PlansService = class PlansService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(actorUserId, data) {
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
    async findAll(isActive, includeIndicators = false) {
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
    async findOne(id) {
        const plan = await this.prisma.plan.findUnique({ where: { id } });
        if (!plan) {
            throw new common_1.NotFoundException('Plan not found');
        }
        return plan;
    }
    async update(actorUserId, id, data) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const existing = await this.prisma.plan.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Plan not found');
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
    async remove(actorUserId, id) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const existing = await this.prisma.plan.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Plan not found');
        }
        await this.prisma.plan.delete({ where: { id } });
        await this.logAudit(ensuredActorId, 'plan.delete', id, {
            deleted: existing,
        });
        return { deleted: true };
    }
    async updateIndicators(actorUserId, planId, indicatorIds) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            throw new common_1.NotFoundException('Plan not found');
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
    ensureActor(actorUserId) {
        if (!actorUserId) {
            throw new common_1.BadRequestException('Missing x-actor-user-id header');
        }
        return actorUserId;
    }
    async logAudit(actorUserId, action, targetId, metadata) {
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
};
exports.PlansService = PlansService;
exports.PlansService = PlansService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlansService);
//# sourceMappingURL=plans.service.js.map