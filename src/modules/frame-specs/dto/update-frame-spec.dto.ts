import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFrameSpecDto {
  @ApiPropertyOptional({ example: 'P000000000001' })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({ example: 'Full Rim' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Titanium' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 54 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  a?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  b?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dbl?: number;

  @ApiPropertyOptional({ example: 'Rectangle' })
  @IsOptional()
  @IsString()
  shape?: string;

  @ApiPropertyOptional({ example: 21.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;
}
