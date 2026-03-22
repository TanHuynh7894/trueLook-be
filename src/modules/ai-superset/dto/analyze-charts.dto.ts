import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class AnalyzeChartsDto {
  @ApiProperty({
    description: 'Tên model AI muốn sử dụng',
    example: 'gemini-2.5-pro',
  })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({
    description: 'Mảng chứa ID của các biểu đồ cần phân tích và so sánh',
    example: [1, 2],
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  chartIds: number[];
}