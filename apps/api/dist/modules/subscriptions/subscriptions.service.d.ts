import { PrismaService } from '../../prisma/prisma.service';
export declare class SubscriptionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    selectPlan(userId: string, planId: string): Promise<any>;
    getActive(userId: string): Promise<any>;
}
