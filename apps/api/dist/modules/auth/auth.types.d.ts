export declare const UserRole: {
    readonly USER: "USER";
    readonly ADMIN: "ADMIN";
    readonly SUPPORT: "SUPPORT";
};
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
}
export interface AuthenticatedRequest {
    headers: any;
    user: AuthenticatedUser;
}
