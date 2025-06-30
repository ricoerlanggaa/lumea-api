import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshTokenAuthDto } from './dto/refresh-token-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterAuthDto) {
    const result = await this.authService.register(dto);
    return { message: 'Register successfully', data: result };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginAuthDto) {
    const result = await this.authService.login(dto.email, dto.password);
    return { message: 'Login successfully', data: result };
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() dto: RefreshTokenAuthDto) {
    const result = await this.authService.refreshToken(dto.refreshToken);
    return { message: 'Successfully refresh token', data: result };
  }
}
