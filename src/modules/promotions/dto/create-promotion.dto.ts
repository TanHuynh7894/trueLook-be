import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString,IsOptional } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên chương trình khuyến mãi không được để trống' })
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Điều kiện (condition) phải là số' })
  @IsNotEmpty()
  condition: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  discount: number;

  @IsDateString({}, { message: 'Thời gian bắt đầu không hợp lệ' })
  start_time: string;

  @IsDateString({}, { message: 'Thời gian kết thúc không hợp lệ' })
  end_time: string;

  @IsOptional()
  @IsString()
  status?: string;
}