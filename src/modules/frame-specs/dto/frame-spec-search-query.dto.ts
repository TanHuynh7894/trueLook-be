import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FrameSpecSearchQueryDto {
  @ApiPropertyOptional({ example: 'full rim' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'titanium' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiPropertyOptional({ example: 'rectangle' })
  @IsOptional()
  @IsString()
  shape?: string;
}
