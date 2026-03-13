import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class NhanhProductItemDto {
  @ApiProperty({ example: 'SP001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'San pham test' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'SP001' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class CreateNhanhOrderDto {
  @ApiProperty({ example: 'ORDER_TEST_001' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({
    example: 230531,
    description: 'ID kho trên Nhanh.vn, lấy từ /api/store/depot',
  })
  @IsOptional()
  @IsNumber()
  depotId?: number;

  @ApiPropertyOptional({
    example: 'Shipping',
    description: 'Shipping | Shopping | PreOrder',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @IsNotEmpty()
  customerMobile: string;

  @ApiPropertyOptional({ example: '123 Nguyen Hue' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({
    example: 'Hồ Chí Minh',
    description: 'Lấy từ /api/shipping/location',
  })
  @IsOptional()
  @IsString()
  customerCityName?: string;

  @ApiPropertyOptional({
    example: 'Quận 1',
    description: 'Lấy từ /api/shipping/location',
  })
  @IsOptional()
  @IsString()
  customerDistrictName?: string;

  @ApiPropertyOptional({
    example: 'Bến Nghé',
    description: 'Lấy từ /api/shipping/location',
  })
  @IsOptional()
  @IsString()
  customerWardLocationName?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  moneyTransfer?: number;

  @ApiPropertyOptional({
    example: 'New',
    description: 'New | Confirming | Confirmed',
  })
  @IsOptional()
  @IsString()
  @IsIn(['New', 'Confirming', 'Confirmed'])
  status?: string;

  @ApiPropertyOptional({
    type: [NhanhProductItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NhanhProductItemDto)
  productList?: NhanhProductItemDto[];
}
