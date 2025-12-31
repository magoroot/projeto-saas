import { PrismaService } from '../../prisma/prisma.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
export declare class IndicatorsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(actorUserId: string | undefined, data: CreateIndicatorDto): Promise<any>;
    findAll(isActive?: boolean): Promise<any>;
    update(actorUserId: string | undefined, id: string, data: UpdateIndicatorDto): Promise<any>;
    remove(actorUserId: string | undefined, id: string): Promise<{
        deleted: boolean;
    }>;
    private ensureActor;
    private logAudit;
}
