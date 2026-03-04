import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'customer@gmail.com',
    description: 'Email đã đăng ký tài khoản để nhận mã khôi phục',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Vui lòng không để trống Email' })
  email: string;
}
