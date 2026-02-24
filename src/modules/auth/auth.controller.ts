import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. Đăng ký tài khoản
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  // 2. Đăng nhập
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: any) {
    return this.authService.signIn(loginDto.username, loginDto.password);
  }

  // 3. Gia hạn Token (Cần Refresh Token Vệ sĩ)
  @UseGuards(AuthGuard('jwt-refresh')) 
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: any) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  // 4. Đăng xuất
  @UseGuards(AuthGuard('jwt')) 
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    const userId = req.user.sub;
    return this.authService.logout(userId);
  }

  // 5. Quên mật khẩu
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // 6. Đặt lại mật khẩu
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(email, otp, newPassword);
  }

  // 7. Đổi mật khẩu chủ động
  @UseGuards(AuthGuard('jwt')) 
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(
    @Req() req: any,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    const userId = req.user.sub;
    return this.authService.changePassword(userId, oldPassword, newPassword);
  }
}