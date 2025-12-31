import { IndicatorsService } from './indicators.service';
import { CreateIndicatorDto } from './dto/create-indicator.dto';
import { UpdateIndicatorDto } from './dto/update-indicator.dto';
import { AuthenticatedRequest } from '../auth/auth.types';
export declare class IndicatorsController {
    private readonly indicatorsService;
    constructor(indicatorsService: IndicatorsService);
    findAll(isActive?: string): Promise<any>;
    create(req: AuthenticatedRequest, createIndicatorDto: CreateIndicatorDto): Promise<any>;
    update(req: AuthenticatedRequest, id: string, updateIndicatorDto: UpdateIndicatorDto): Promise<any>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        deleted: boolean;
    }>;
}
