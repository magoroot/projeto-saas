import { PrismaService } from '../../prisma/prisma.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
export declare class SetupsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: CreateSetupDto): Promise<any>;
    findAll(userId: string): Promise<any>;
    findOne(userId: string, id: string): Promise<any>;
    update(userId: string, id: string, data: UpdateSetupDto): Promise<any>;
    remove(userId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    private validateIndicatorsAllowed;
    private normalizeIndicators;
}
