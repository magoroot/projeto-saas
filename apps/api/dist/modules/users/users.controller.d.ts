import { UsersService } from './users.service';
import { AuthenticatedRequest } from '../auth/auth.types';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<any>;
    updateStatus(req: AuthenticatedRequest, id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<any>;
    updatePlan(req: AuthenticatedRequest, id: string, planId: string): Promise<any>;
}
