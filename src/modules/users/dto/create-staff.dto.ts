import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  IsIn,
  IsOptional
} from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({ example: 'nhanvien01', description: 'Tên đăng nhập' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @ApiProperty({ example: 'Password123@', description: 'Mật khẩu (Ít nhất 6 ký tự)' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A', description: 'Họ và tên (Có thể bỏ trống)' })
  @IsOptional()
  @IsString()
  fullName?: string; 

  @ApiPropertyOptional({ example: 'staff@gmail.com', description: 'Email (Có thể bỏ trống)' })
  @IsOptional() 
  @IsEmail({}, { message: 'Nếu có nhập email thì phải đúng định dạng' })
  email?: string;

  @ApiProperty({ 
    example: 'Manager', 
    enum: ['Manager', 'System Admin'],
    description: 'Quyền hạn của nhân viên' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng chọn quyền cho nhân viên' })
  @IsIn(['Manager', 'System Admin'], { message: 'Quyền không hợp lệ (Chỉ nhận Manager hoặc System Admin)' })
  roleName: string;
}