import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    updateStatus(actorUserId: string | undefined, userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<any>;
    changePlan(actorUserId: string | undefined, userId: string, planId: string): Promise<any>;
    private ensureActor;
    private logAudit;
}
