import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateFeatureDto {
  @ApiPropertyOptional({ example: 'RX000000000001' })
  @IsOptional()
  @IsString()
  rx_lens_id?: string;

  @ApiPropertyOptional({ example: 'Blue light filter' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Giup giam anh sang xanh tu man hinh' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;
}
