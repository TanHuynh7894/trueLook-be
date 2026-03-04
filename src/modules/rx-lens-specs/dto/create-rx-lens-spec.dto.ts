import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRxLensSpecDto {
  @ApiProperty({ example: 'P000000000001' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 'Single Vision' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Polycarbonate' })
  @IsString()
  @IsNotEmpty()
  material: string;

  @ApiProperty({ example: 56 })
  @Type(() => Number)
  @IsNumber()
  lens_width: number;

  @ApiProperty({ example: -10 })
  @Type(() => Number)
  @IsNumber()
  min_sphere: number;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  max_sphere: number;

  @ApiProperty({ example: -6 })
  @Type(() => Number)
  @IsNumber()
  min_cylinder: number;

  @ApiProperty({ example: 6 })
  @Type(() => Number)
  @IsNumber()
  max_cylinder: number;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;
}
