import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { PlansModule } from './modules/plans/plans.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { IndicatorsModule } from './modules/indicators/indicators.module';
import { SetupsModule } from './modules/setups/setups.module';
import { AdminAuditModule } from './modules/admin-audit/admin-audit.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    IndicatorsModule,
    SetupsModule,
    AdminAuditModule,
  ],
})
export class AppModule {}
