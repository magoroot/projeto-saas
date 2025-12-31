import { SeedService } from './seed.service';
export declare class SeedController {
    private readonly seedService;
    constructor(seedService: SeedService);
    reseed(): Promise<void>;
}
