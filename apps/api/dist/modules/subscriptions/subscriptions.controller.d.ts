import { SubscriptionsService } from './subscriptions.service';
import { AuthenticatedRequest } from '../auth/auth.types';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getActive(req: AuthenticatedRequest): Promise<any>;
    selectPlan(req: AuthenticatedRequest, planId: string): Promise<any>;
}
