import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class GetDepotsQueryDto {
  @ApiPropertyOptional({
    example: 230531,
    description: 'ID kho cần tìm. Bỏ trống để lấy toàn bộ kho.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  depotId?: number;
}
