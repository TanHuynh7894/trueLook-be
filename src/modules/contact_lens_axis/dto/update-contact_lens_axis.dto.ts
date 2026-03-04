import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateContactLensAxisDto {
  @ApiPropertyOptional({ example: '2' })
  @IsOptional()
  @IsString()
  contact_lens_spec_id?: string;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  axis_value?: number;
}
