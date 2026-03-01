import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductVariantSearchQueryDto {
  @ApiPropertyOptional({ example: 'oakley' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Kinh mat' })
  @IsOptional()
  @IsString()
  category_name?: string;

  @ApiPropertyOptional({ example: 'frame' })
  @IsOptional()
  @IsString()
  product_type?: string;

  @ApiPropertyOptional({ example: 300000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_price?: number;

  @ApiPropertyOptional({ example: 1200000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_price?: number;

  @ApiPropertyOptional({ example: 'red' })
  @IsOptional()
  @IsString()
  color?: string;
}
