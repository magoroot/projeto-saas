import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthenticatedRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.user.role,
    );
    return result;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.user.role,
    );
    return result;
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      dto.refreshToken ?? this.getCookie(req, 'saas_refresh_token');
    const result = await this.authService.refresh({ refreshToken });
    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      result.user.role,
    );
    return result;
  }

  @Post('logout')
  async logout(
    @Body() dto: LogoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      dto.refreshToken ?? this.getCookie(req, 'saas_refresh_token');
    const result = await this.authService.logout({ refreshToken });
    this.clearAuthCookies(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.id);
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    role: string,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: isProduction,
      path: '/',
    };
    res.cookie('saas_access_token', accessToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60,
    });
    res.cookie('saas_refresh_token', refreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
    res.cookie('saas_user_role', role, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }

  private clearAuthCookies(res: Response) {
    res.cookie('saas_access_token', '', { path: '/', maxAge: 0 });
    res.cookie('saas_refresh_token', '', { path: '/', maxAge: 0 });
    res.cookie('saas_user_role', '', { path: '/', maxAge: 0 });
  }

  private getCookie(req: Request, name: string) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return undefined;
    }
    const cookies = cookieHeader.split(';').reduce<Record<string, string>>(
      (acc, part) => {
        const [key, ...rest] = part.trim().split('=');
        if (!key) {
          return acc;
        }
        acc[key] = decodeURIComponent(rest.join('='));
        return acc;
      },
      {},
    );
    return cookies[name];
  }
}
