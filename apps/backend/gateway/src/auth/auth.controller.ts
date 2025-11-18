/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuthRefreshResponse, LoginResponse, PendingLoginResponse } from '@limbo/common';
import { AuthLoginResponseDto } from '@limbo/users-contracts';
import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CompleteSetupDto, LoginDto } from './dtos';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PendingJwtGuard } from './guards/pending-jwt.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import ms = require('ms');

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string
  ): Promise<LoginResponse | PendingLoginResponse> {
    const result = await this.authService.login(loginDto, userAgent);

    if ('pendingToken' in result) {
      return { pendingToken: result.pendingToken };
    }

    const maxAgeString = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');

    const maxAgeMs = ms(maxAgeString as any) as unknown as number;

    res.cookie('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeMs,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('complete-setup')
  @UseGuards(PendingJwtGuard)
  @UsePipes(new ValidationPipe())
  async completeSetup(
    @Req() req,
    @Body() dto: CompleteSetupDto,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string
  ): Promise<LoginResponse> {
    const userId = req.user.id;

    const result = (await this.authService.completeSetup(userId, dto, userAgent)) as AuthLoginResponseDto;

    const maxAgeString = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const maxAgeMs = ms(maxAgeString as any) as unknown as number;

    res.cookie('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeMs,
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res: Response,
    @Headers('user-agent') userAgent: string
  ): Promise<AuthRefreshResponse> {
    const { id, jti } = req.user;
    const result = await this.authService.refresh(id, jti, userAgent);

    const maxAgeString = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
    const maxAgeMs = ms(maxAgeString as any) as unknown as number;

    res.cookie('refresh-token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeMs,
    });

    return {
      accessToken: result.accessToken,
    };
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { jti } = req.user;

    await this.authService.logout(jti);

    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { statusCode: HttpStatus.OK, message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { id: userId } = req.user;

    await this.authService.logoutAll(userId);

    res.clearCookie('refresh-token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { statusCode: HttpStatus.OK, message: 'Logged out from all devices' };
  }
}
