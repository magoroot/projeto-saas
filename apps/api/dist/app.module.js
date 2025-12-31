"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./modules/users/users.module");
const plans_module_1 = require("./modules/plans/plans.module");
const subscriptions_module_1 = require("./modules/subscriptions/subscriptions.module");
const indicators_module_1 = require("./modules/indicators/indicators.module");
const setups_module_1 = require("./modules/setups/setups.module");
const admin_audit_module_1 = require("./modules/admin-audit/admin-audit.module");
const auth_module_1 = require("./modules/auth/auth.module");
const seed_module_1 = require("./seed/seed.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            seed_module_1.SeedModule,
            users_module_1.UsersModule,
            plans_module_1.PlansModule,
            subscriptions_module_1.SubscriptionsModule,
            indicators_module_1.IndicatorsModule,
            setups_module_1.SetupsModule,
            admin_audit_module_1.AdminAuditModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map