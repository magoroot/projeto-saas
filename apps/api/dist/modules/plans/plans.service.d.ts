import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlansService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(actorUserId: string | undefined, data: CreatePlanDto): Promise<any>;
    findAll(isActive?: boolean, includeIndicators?: boolean): Promise<any>;
    findOne(id: string): Promise<any>;
    update(actorUserId: string | undefined, id: string, data: UpdatePlanDto): Promise<any>;
    remove(actorUserId: string | undefined, id: string): Promise<{
        deleted: boolean;
    }>;
    updateIndicators(actorUserId: string | undefined, planId: string, indicatorIds: string[]): Promise<any>;
    private ensureActor;
    private logAudit;
}
