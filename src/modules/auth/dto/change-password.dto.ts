import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'MatKhauCu123!' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: 'MatKhauMoi456!' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
