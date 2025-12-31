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
exports.SeedController = void 0;
const common_1 = require("@nestjs/common");
const seed_service_1 = require("./seed.service");
const jwt_auth_guard_1 = require("../modules/auth/jwt-auth.guard");
const roles_guard_1 = require("../modules/auth/roles.guard");
const roles_decorator_1 = require("../modules/auth/roles.decorator");
const auth_types_1 = require("../modules/auth/auth.types");
let SeedController = class SeedController {
    constructor(seedService) {
        this.seedService = seedService;
    }
    reseed() {
        return this.seedService.reseed();
    }
};
exports.SeedController = SeedController;
__decorate([
    (0, common_1.Post)('reseed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(auth_types_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SeedController.prototype, "reseed", null);
exports.SeedController = SeedController = __decorate([
    (0, common_1.Controller)('admin/seed'),
    __metadata("design:paramtypes", [seed_service_1.SeedService])
], SeedController);
//# sourceMappingURL=seed.controller.js.map