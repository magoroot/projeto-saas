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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async updateStatus(actorUserId, userId, status) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
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
    async changePlan(actorUserId, userId, planId) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            throw new common_1.NotFoundException('Plan not found');
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
    ensureActor(actorUserId) {
        if (!actorUserId) {
            throw new common_1.BadRequestException('Missing actor user');
        }
        return actorUserId;
    }
    async logAudit(actorUserId, action, targetId, metadata) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map