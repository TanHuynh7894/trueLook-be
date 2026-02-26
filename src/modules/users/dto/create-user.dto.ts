import { IsString, IsNotEmpty, IsEmail, IsDateString, IsInt, IsIn, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  gender: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString()
  birthday: string;

  @ApiProperty({ example: 1, description: '1: Hoạt động, 0: Khóa' })
  @IsOptional()
  @IsInt()
  @IsIn([0, 1], { message: 'Trạng thái (status) chỉ được phép là 0 hoặc 1' })
  status?: number;
}