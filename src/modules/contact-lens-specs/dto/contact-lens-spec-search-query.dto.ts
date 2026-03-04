import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ContactLensSpecSearchQueryDto {
  @ApiPropertyOptional({ example: 'acuvue' })
  @IsOptional()
  @IsString()
  product_name?: string;

  @ApiPropertyOptional({ example: 8.6 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  base_curve?: number;

  @ApiPropertyOptional({ example: 14.2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  diameter?: number;

  @ApiPropertyOptional({ example: -8, description: 'Gia tri sphere toi thieu' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sphere_min?: number;

  @ApiPropertyOptional({ example: 0, description: 'Gia tri sphere toi da' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sphere_max?: number;

  @ApiPropertyOptional({
    example: -2.25,
    description: 'Gia tri cylinder toi thieu',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cylinder_min?: number;

  @ApiPropertyOptional({
    example: -0.75,
    description: 'Gia tri cylinder toi da',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cylinder_max?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  axis?: number;
}
