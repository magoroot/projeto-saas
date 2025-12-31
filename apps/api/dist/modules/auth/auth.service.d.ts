import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
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
    login(dto: LoginDto): Promise<{
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
    refresh(dto: RefreshDto): Promise<{
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
    logout(dto: LogoutDto): Promise<{
        loggedOut: boolean;
    }>;
    me(userId: string): Promise<{
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
    private issueTokens;
    private hashToken;
}
