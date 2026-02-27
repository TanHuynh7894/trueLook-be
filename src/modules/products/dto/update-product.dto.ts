import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Ray-Ban Aviator' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'RB-AVI-001' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiPropertyOptional({ example: 'Mo ta goc da duoc cap nhat' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 'Frame' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  product_type?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status?: string;

  @ApiPropertyOptional({ example: '1772179859988' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand_id?: string;
}
