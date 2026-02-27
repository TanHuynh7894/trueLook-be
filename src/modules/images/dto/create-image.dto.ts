import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: '1772179859988' })
  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @ApiProperty({ example: 'https://example.com/images/product-variant.jpg' })
  @IsString()
  @IsNotEmpty()
  path: string;
}
