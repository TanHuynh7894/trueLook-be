import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RxLensSpecSearchQueryDto {
  @ApiPropertyOptional({ example: 'Single Vision' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Polycarbonate' })
  @IsOptional()
  @IsString()
  material?: string;
}
