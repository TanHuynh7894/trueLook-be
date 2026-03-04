import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LoginDto } from './dto/login.dto';
import { ApiBody } from '@nestjs/swagger';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Redirect login by Google OAuth' })
  async googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @HttpCode(HttpStatus.OK)
  googleAuthCallback(@Req() req: any) {
    return this.authService.signInWithGoogle(req.user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Dang ky tai khoan khach hang moi' })
  @ApiBody({ type: RegisterDto })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Dang nhap' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.username, loginDto.password);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: any) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Dang xuat' })
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    const userId = req.user.sub;
    return this.authService.logout(userId);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Gui yeu cau khoi phuc mat khau' })
  @ApiBody({ type: ForgotPasswordDto })
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Dat lai mat khau bang OTP/Token' })
  @ApiBody({ type: ResetPasswordDto })
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, otp, newPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Doi mat khau khi dang dang nhap' })
  @ApiBody({ type: ChangePasswordDto })
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user.sub;
    return this.authService.changePassword(userId, dto);
  }
}
