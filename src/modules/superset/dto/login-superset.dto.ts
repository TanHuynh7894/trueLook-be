import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginSupersetDto {
  @ApiProperty({ example: 'admin', description: 'Tài khoản Superset' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '123456', description: 'Mật khẩu Superset' })
  @IsString()
  @IsNotEmpty()
  password: string;
}