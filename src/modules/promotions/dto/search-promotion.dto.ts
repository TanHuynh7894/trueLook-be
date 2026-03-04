import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchPromotionDto {
  @ApiPropertyOptional({ description: 'Tên khuyến mãi (tìm gần đúng)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Số tiền đơn hàng để tìm KM phù hợp' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  money?: number;
}