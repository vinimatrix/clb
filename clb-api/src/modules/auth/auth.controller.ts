import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategies/jwt.guard';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('login')
  async login(@Body() body: { cedula: string; password: string }) {
    const user = await this.authService.validateUser(body.cedula, body.password);
    if (!user) {
      return { statusCode: 401, message: 'Credenciales incorrectas' };
    }
    return this.authService.login(user);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string; userId: number }) {
    return this.authService.refresh(body.refreshToken, body.userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Req() req: any) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return req.user;
  }
}
