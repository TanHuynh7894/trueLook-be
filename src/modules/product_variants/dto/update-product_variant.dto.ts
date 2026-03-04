import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProductVariantDto {
  @ApiPropertyOptional({ example: 'P000000000001' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  product_id?: string;

  @ApiPropertyOptional({ example: 'PV001-BLK' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiPropertyOptional({ example: 'Classic Black 54' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 1490000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  price?: number;

  @ApiPropertyOptional({ example: 'Black' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ example: 'Phien ban mau den co size 54' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status?: string;
}
