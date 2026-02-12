import { IsString, IsNotEmpty, IsEmail, IsDateString } from 'class-validator';

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
}