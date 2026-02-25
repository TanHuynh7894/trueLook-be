import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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

  // 1. Đăng ký tài khoản
  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản khách hàng mới' })
  @ApiBody({ type: RegisterDto })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  // 2. Đăng nhập
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: LoginDto})
  login(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.username, loginDto.password);
  }

  // 3. Gia hạn Token (Cần Refresh Token Vệ sĩ)
  @UseGuards(AuthGuard('jwt-refresh')) 
  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: any) {
    const userId = req.user.sub;
    const refreshToken = req.user.refreshToken;
    return this.authService.refreshTokens(userId, refreshToken);
  }

  // 4. Đăng xuất
  @UseGuards(AuthGuard('jwt')) 
  @ApiBearerAuth('access-token')
  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất' })
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: any) {
    const userId = req.user.sub;
    return this.authService.logout(userId);
  }

  // 5. Quên mật khẩu
  @Post('forgot-password')
  @ApiOperation({ summary: 'Gửi yêu cầu khôi phục mật khẩu' })
  @ApiBody({ type: ForgotPasswordDto })
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // 6. Đặt lại mật khẩu
  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng mã OTP/Token' })
  @ApiBody({ type: ResetPasswordDto })
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
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Đổi mật khẩu khi đang đăng nhập' })
  @ApiBody({ type: ChangePasswordDto })
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