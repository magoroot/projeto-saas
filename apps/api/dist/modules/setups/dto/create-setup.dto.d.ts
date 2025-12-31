declare class SetupIndicatorDto {
    code: string;
    enabled?: boolean;
    params?: Record<string, unknown>;
}
export declare class CreateSetupDto {
    name: string;
    symbol: string;
    timeframe: string;
    indicators: SetupIndicatorDto[];
    isDefault?: boolean;
}
export {};
