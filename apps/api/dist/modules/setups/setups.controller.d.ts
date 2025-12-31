import { SetupsService } from './setups.service';
import { CreateSetupDto } from './dto/create-setup.dto';
import { UpdateSetupDto } from './dto/update-setup.dto';
import { AuthenticatedRequest } from '../auth/auth.types';
export declare class SetupsController {
    private readonly setupsService;
    constructor(setupsService: SetupsService);
    create(req: AuthenticatedRequest, createSetupDto: CreateSetupDto): Promise<any>;
    findAll(req: AuthenticatedRequest): Promise<any>;
    findOne(req: AuthenticatedRequest, id: string): Promise<any>;
    update(req: AuthenticatedRequest, id: string, updateSetupDto: UpdateSetupDto): Promise<any>;
    remove(req: AuthenticatedRequest, id: string): Promise<{
        deleted: boolean;
    }>;
}
