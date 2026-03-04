import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateRxLensSpecDto {
  @ApiPropertyOptional({ example: 'P000000000001' })
  @IsOptional()
  @IsString()
  product_id?: string;

  @ApiPropertyOptional({ example: 'Single Vision' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Polycarbonate' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 56 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lens_width?: number;

  @ApiPropertyOptional({ example: -10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_sphere?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_sphere?: number;

  @ApiPropertyOptional({ example: -6 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_cylinder?: number;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;
}
