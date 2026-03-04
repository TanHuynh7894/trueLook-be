import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartItemDto {

  @ApiProperty({ example: '1', description: 'ID của Product Variant (Mắt kính/Gọng kính...)' })
  @IsString({ message: 'Variant ID phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng chọn sản phẩm' })
  variant_id: string;

  @ApiProperty({ example: 1, description: 'Số lượng sản phẩm thêm vào giỏ (Ít nhất là 1)' })
  @Type(() => Number)
  @IsInt({ message: 'Số lượng phải là số nguyên' })
  @Min(1, { message: 'Số lượng sản phẩm ít nhất phải là 1' })
  quantity: number;
}