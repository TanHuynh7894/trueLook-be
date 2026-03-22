import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsNotEmpty } from 'class-validator';

export class PreviewDataDto {
  @ApiProperty({
    description: 'Mảng chứa ID của các biểu đồ cần xem trước từ Superset',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  chartIds: number[];
}