import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ProductSearchQueryDto {
  @ApiPropertyOptional({ example: 'ray' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: '1772179859988' })
  @IsOptional()
  @IsString()
  brand_id?: string;

  @ApiPropertyOptional({ example: '1772179859999' })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ example: 'frame' })
  @IsOptional()
  @IsString()
  product_type?: string;
}
