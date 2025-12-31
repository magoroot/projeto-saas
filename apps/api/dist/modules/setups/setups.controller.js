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
exports.SetupsController = void 0;
const common_1 = require("@nestjs/common");
const setups_service_1 = require("./setups.service");
const create_setup_dto_1 = require("./dto/create-setup.dto");
const update_setup_dto_1 = require("./dto/update-setup.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SetupsController = class SetupsController {
    constructor(setupsService) {
        this.setupsService = setupsService;
    }
    create(req, createSetupDto) {
        return this.setupsService.create(req.user.id, createSetupDto);
    }
    findAll(req) {
        return this.setupsService.findAll(req.user.id);
    }
    findOne(req, id) {
        return this.setupsService.findOne(req.user.id, id);
    }
    update(req, id, updateSetupDto) {
        return this.setupsService.update(req.user.id, id, updateSetupDto);
    }
    remove(req, id) {
        return this.setupsService.remove(req.user.id, id);
    }
};
exports.SetupsController = SetupsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_setup_dto_1.CreateSetupDto]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_setup_dto_1.UpdateSetupDto]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SetupsController.prototype, "remove", null);
exports.SetupsController = SetupsController = __decorate([
    (0, common_1.Controller)('setups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [setups_service_1.SetupsService])
], SetupsController);
//# sourceMappingURL=setups.controller.js.map