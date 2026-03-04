import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class CreateFrameSpecDto {
  @ApiProperty({ example: 'P000000000001' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 'Full Rim' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'Titanium' })
  @IsString()
  @IsNotEmpty()
  material: string;

  @ApiProperty({ example: 54 })
  @Type(() => Number)
  @IsNumber()
  a: number;

  @ApiProperty({ example: 40 })
  @Type(() => Number)
  @IsNumber()
  b: number;

  @ApiProperty({ example: 18 })
  @Type(() => Number)
  @IsNumber()
  dbl: number;

  @ApiProperty({ example: 'Rectangle' })
  @IsString()
  @IsNotEmpty()
  shape: string;

  @ApiProperty({ example: 21.5 })
  @Type(() => Number)
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 'Active' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
