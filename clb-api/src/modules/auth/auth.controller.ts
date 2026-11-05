import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './strategies/jwt.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { cedula: string; password: string }) {
    const user = await this.authService.validateUser(body.cedula, body.password);
    if (!user) {
      return { statusCode: 401, message: 'Credenciales incorrectas' };
    }
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout() {
    return { message: 'Sesión cerrada' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return req.user;
  }
}