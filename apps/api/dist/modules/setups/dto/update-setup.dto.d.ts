declare class SetupIndicatorDto {
    code: string;
    enabled?: boolean;
    params?: Record<string, unknown>;
}
export declare class UpdateSetupDto {
    name?: string;
    symbol?: string;
    timeframe?: string;
    indicators?: SetupIndicatorDto[];
    isDefault?: boolean;
}
export {};
