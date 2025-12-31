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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let JwtAuthGuard = class JwtAuthGuard {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const token = this.getTokenFromRequest(request);
        if (!token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'dev-secret',
            });
            request.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            };
            return true;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    getTokenFromRequest(request) {
        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.slice(7);
        }
        const cookieHeader = request.headers.cookie;
        if (!cookieHeader) {
            return null;
        }
        const cookies = cookieHeader.split(';').reduce((acc, part) => {
            const [key, ...rest] = part.trim().split('=');
            if (!key) {
                return acc;
            }
            acc[key] = decodeURIComponent(rest.join('='));
            return acc;
        }, {});
        return cookies.saas_access_token ?? null;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map