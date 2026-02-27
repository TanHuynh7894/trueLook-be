import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'Ray-Ban' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  status?: string;
}
