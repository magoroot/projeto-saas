export declare class CreateIndicatorDto {
    code: string;
    name: string;
    description: string;
    category: string;
    isPremium?: boolean;
    defaultParams?: Record<string, unknown>;
    userParamsEditable?: boolean;
    isActive?: boolean;
}
