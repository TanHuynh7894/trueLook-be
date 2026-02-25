import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ 
    example: 'chuoi-token-lay-tu-email', 
    description: 'Mã xác thực được gửi về Email của ông' 
  })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({ 
    example: 'NewPassword123!', 
    description: 'Mật khẩu mới muốn thay đổi' 
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}