import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactLensAxisDto {
  @ApiProperty({ example: '2' })
  @IsString()
  @IsNotEmpty()
  contact_lens_spec_id: string;

  @ApiProperty({ example: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  axis_value?: number;
}
