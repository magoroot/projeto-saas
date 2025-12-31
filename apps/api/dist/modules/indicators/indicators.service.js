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
exports.IndicatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let IndicatorsService = class IndicatorsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(actorUserId, data) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const indicator = await this.prisma.indicator.create({
            data: {
                code: data.code.toUpperCase(),
                name: data.name,
                description: data.description,
                category: data.category,
                isPremium: data.isPremium ?? false,
                defaultParams: data.defaultParams ?? {},
                userParamsEditable: data.userParamsEditable ?? true,
                isActive: data.isActive ?? true,
            },
        });
        await this.logAudit(ensuredActorId, 'indicator.create', indicator.id, {
            created: indicator,
        });
        return indicator;
    }
    async findAll(isActive) {
        return this.prisma.indicator.findMany({
            where: isActive === undefined ? undefined : { isActive },
            orderBy: { name: 'asc' },
        });
    }
    async update(actorUserId, id, data) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const existing = await this.prisma.indicator.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Indicator not found');
        }
        const updated = await this.prisma.indicator.update({
            where: { id },
            data: {
                ...data,
                code: data.code ? data.code.toUpperCase() : undefined,
                defaultParams: data.defaultParams ?? undefined,
            },
        });
        await this.logAudit(ensuredActorId, 'indicator.update', id, {
            before: existing,
            after: updated,
        });
        return updated;
    }
    async remove(actorUserId, id) {
        const ensuredActorId = this.ensureActor(actorUserId);
        const existing = await this.prisma.indicator.findUnique({ where: { id } });
        if (!existing) {
            throw new common_1.NotFoundException('Indicator not found');
        }
        await this.prisma.indicator.delete({ where: { id } });
        await this.logAudit(ensuredActorId, 'indicator.delete', id, {
            deleted: existing,
        });
        return { deleted: true };
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
                targetType: 'Indicator',
                targetId,
                metadata,
            },
        });
    }
};
exports.IndicatorsService = IndicatorsService;
exports.IndicatorsService = IndicatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], IndicatorsService);
//# sourceMappingURL=indicators.service.js.map