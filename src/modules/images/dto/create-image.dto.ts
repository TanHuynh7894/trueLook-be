import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: '1772179859988' })
  @IsString()
  @IsOptional()
  variant_id?: string;

  @ApiProperty({ example: 'https://example.com/images/product-variant.jpg' })
  @IsOptional()
  @IsString()
  path?: string;
}
