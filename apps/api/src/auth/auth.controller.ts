import { Controller, Post, Body, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuditService } from './audit.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private auditService: AuditService
  ) {}

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(@Body() body: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { email, password } = body;
    try {
      const data = await this.authService.login(email, password);

      // Set Refresh Token in HttpOnly cookie
      res.cookie('refresh_token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      await this.auditService.logEvent(data.user.id, 'auth', data.user.id, 'login', null, null, req.ip);

      return {
        access_token: data.session.access_token,
        user: data.user,
      };
    } catch (error) {
       // Log failed attempt if we had user context, but here we might not have it reliably without searching by email first.
       // For now, simple error throw.
       throw error;
    }
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const data = await this.authService.refreshToken(refreshToken);
    await this.auditService.logEvent(data.user.id, 'auth', data.user.id, 'token_refresh', null, null, req.ip);
    return data;
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req['user'];
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await this.authService.logout(token);
    }
    if (user) {
      await this.auditService.logEvent(user.id, 'auth', user.id, 'logout', null, null, req.ip);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }
}
