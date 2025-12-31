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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const ACCESS_TOKEN_TTL = process.env.JWT_EXPIRES_IN ?? '15m';
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? '30');
let AuthService = class AuthService {
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existing) {
            throw new common_1.BadRequestException('Email already in use');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email.toLowerCase(),
                passwordHash,
                role: 'USER',
                status: 'ACTIVE',
            },
        });
        const plan = await this.prisma.plan.findFirst({
            where: { name: 'Starter', isActive: true },
            orderBy: { createdAt: 'asc' },
        });
        if (!plan) {
            throw new common_1.BadRequestException('No plans available');
        }
        await this.prisma.subscription.create({
            data: {
                userId: user.id,
                planId: plan.id,
                status: 'ACTIVE',
                startedAt: new Date(),
            },
        });
        const tokens = await this.issueTokens(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'ACTIVE') {
            throw new common_1.UnauthorizedException('User is suspended');
        }
        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const tokens = await this.issueTokens(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            ...tokens,
        };
    }
    async refresh(dto) {
        if (!dto.refreshToken) {
            throw new common_1.UnauthorizedException('Missing refresh token');
        }
        const tokenHash = this.hashToken(dto.refreshToken);
        const existing = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });
        if (!existing || existing.revokedAt) {
            throw new common_1.UnauthorizedException('Refresh token revoked');
        }
        if (existing.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        await this.prisma.refreshToken.update({
            where: { id: existing.id },
            data: { revokedAt: new Date() },
        });
        const tokens = await this.issueTokens(existing.userId, existing.user.email, existing.user.role);
        return {
            user: {
                id: existing.user.id,
                name: existing.user.name,
                email: existing.user.email,
                role: existing.user.role,
            },
            ...tokens,
        };
    }
    async logout(dto) {
        if (!dto.refreshToken) {
            return { loggedOut: true };
        }
        const tokenHash = this.hashToken(dto.refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return { loggedOut: true };
    }
    async me(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                subscriptions: {
                    where: {
                        status: 'ACTIVE',
                        OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
                    },
                    orderBy: { startedAt: 'desc' },
                    take: 1,
                    include: {
                        plan: {
                            include: {
                                planIndicators: {
                                    include: { indicator: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const subscription = user.subscriptions[0];
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
            subscription: subscription
                ? {
                    id: subscription.id,
                    status: subscription.status,
                    startedAt: subscription.startedAt,
                    plan: subscription.plan,
                    indicators: subscription.plan.planIndicators.map((item) => item.indicator),
                }
                : null,
        };
    }
    async issueTokens(userId, email, role) {
        const accessToken = await this.jwtService.signAsync({ sub: userId, email, role }, {
            secret: process.env.JWT_SECRET || 'dev-secret',
            expiresIn: ACCESS_TOKEN_TTL,
        });
        const refreshToken = (0, crypto_1.randomBytes)(48).toString('hex');
        const tokenHash = this.hashToken(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
            expiresIn: ACCESS_TOKEN_TTL,
        };
    }
    hashToken(token) {
        return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map