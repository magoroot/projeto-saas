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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const refresh_dto_1 = require("./dto/refresh.dto");
const logout_dto_1 = require("./dto/logout.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto, res) {
        const result = await this.authService.register(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken, result.user.role);
        return result;
    }
    async login(dto, res) {
        const result = await this.authService.login(dto);
        this.setAuthCookies(res, result.accessToken, result.refreshToken, result.user.role);
        return result;
    }
    async refresh(dto, req, res) {
        const refreshToken = dto.refreshToken ?? this.getCookie(req, 'saas_refresh_token');
        const result = await this.authService.refresh({ refreshToken });
        this.setAuthCookies(res, result.accessToken, result.refreshToken, result.user.role);
        return result;
    }
    async logout(dto, req, res) {
        const refreshToken = dto.refreshToken ?? this.getCookie(req, 'saas_refresh_token');
        const result = await this.authService.logout({ refreshToken });
        this.clearAuthCookies(res);
        return result;
    }
    me(req) {
        return this.authService.me(req.user.id);
    }
    setAuthCookies(res, accessToken, refreshToken, role) {
        const isProduction = process.env.NODE_ENV === 'production';
        const cookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            secure: isProduction,
            path: '/',
        };
        res.cookie('saas_access_token', accessToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60,
        });
        res.cookie('saas_refresh_token', refreshToken, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });
        res.cookie('saas_user_role', role, {
            ...cookieOptions,
            maxAge: 1000 * 60 * 60 * 24 * 30,
        });
    }
    clearAuthCookies(res) {
        res.cookie('saas_access_token', '', { path: '/', maxAge: 0 });
        res.cookie('saas_refresh_token', '', { path: '/', maxAge: 0 });
        res.cookie('saas_user_role', '', { path: '/', maxAge: 0 });
    }
    getCookie(req, name) {
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
            return undefined;
        }
        const cookies = cookieHeader.split(';').reduce((acc, part) => {
            const [key, ...rest] = part.trim().split('=');
            if (!key) {
                return acc;
            }
            acc[key] = decodeURIComponent(rest.join('='));
            return acc;
        }, {});
        return cookies[name];
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_dto_1.RefreshDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logout_dto_1.LogoutDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map