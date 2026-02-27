import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Kinh ram' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'active' })
  @IsString()
  @IsNotEmpty()
  status: string;
}
