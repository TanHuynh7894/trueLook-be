import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @ApiProperty({ 
    example: '1', 
    description: 'ID của khách hàng sở hữu giỏ hàng (Chỉ dùng cho Admin hoặc Internal Service)' 
  })
  @IsString({ message: 'User ID phải là một chuỗi ký tự' })
  @IsNotEmpty({ message: 'User ID không được để trống' })
  user_id: string;
}