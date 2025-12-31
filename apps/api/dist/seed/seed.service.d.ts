import { PrismaService } from '../prisma/prisma.service';
export declare class SeedService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    ensureSeed(): Promise<void>;
    reseed(): Promise<void>;
    private ensureDefaultAdmin;
}
