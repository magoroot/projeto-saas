import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AuthenticatedRequest } from '../auth/auth.types';
export declare class PlansController {
    private readonly plansService;
    constructor(plansService: PlansService);
    create(req: AuthenticatedRequest, createPlanDto: CreatePlanDto): Promise<any>;
    findAll(isActive?: string, includeIndicators?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(req: AuthenticatedRequest, id: string, updatePlanDto: UpdatePlanDto): Promise<any>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        deleted: boolean;
    }>;
    updateIndicators(req: AuthenticatedRequest, id: string, indicatorIds: string[]): Promise<any>;
}
