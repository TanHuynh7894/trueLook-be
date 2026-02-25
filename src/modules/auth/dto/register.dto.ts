import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, MinLength, IsDateString, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'khachhang01', description: 'Tên đăng nhập' })
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({ example: 'MatKhauSieuCap123!', description: 'Mật khẩu (ít nhất 6 ký tự)' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password: string;

  @ApiProperty({ example: 'khachhang01@gmail.com', description: 'Địa chỉ Email' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Nguyễn Văn Khách', description: 'Họ và tên đầy đủ' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'M', description: 'Giới tính (M: Nam, F: Nữ, O: Khác)', required: false })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: '2000-01-01', description: 'Ngày tháng năm sinh (YYYY-MM-DD)', required: false })
  @IsDateString({}, { message: 'Ngày sinh phải đúng định dạng YYYY-MM-DD' })
  @IsOptional()
  birthday?: string;
}