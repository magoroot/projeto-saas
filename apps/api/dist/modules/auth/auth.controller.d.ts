type Response = any;
type Request = any;
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { AuthenticatedRequest } from './auth.types';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    refresh(dto: RefreshDto, req: Request, res: Response): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: string;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
        };
    }>;
    logout(dto: LogoutDto, req: Request, res: Response): Promise<{
        loggedOut: boolean;
    }>;
    me(req: AuthenticatedRequest): Promise<{
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            status: any;
        };
        subscription: {
            id: any;
            status: any;
            startedAt: any;
            plan: any;
            indicators: any;
        } | null;
    }>;
    private setAuthCookies;
    private clearAuthCookies;
    private getCookie;
}
export {};
