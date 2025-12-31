"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const seed_service_1 = require("./seed/seed.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: process.env.WEB_ORIGIN?.split(',') ?? true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const seedService = app.get(seed_service_1.SeedService);
    await seedService.ensureSeed();
    await app.listen(3001);
}
bootstrap();
//# sourceMappingURL=main.js.map