import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminAuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
}
