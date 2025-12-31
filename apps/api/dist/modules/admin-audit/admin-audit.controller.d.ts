import { AdminAuditService } from './admin-audit.service';
export declare class AdminAuditController {
    private readonly auditService;
    constructor(auditService: AdminAuditService);
    findAll(): Promise<any>;
}
