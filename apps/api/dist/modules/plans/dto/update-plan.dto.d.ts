declare enum Market {
    FOREX = "FOREX",
    INDICES = "INDICES",
    CRYPTO = "CRYPTO"
}
export declare class UpdatePlanDto {
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    maxIndicatorsActive?: number;
    allowedMarkets?: Market[];
    isActive?: boolean;
}
export {};
