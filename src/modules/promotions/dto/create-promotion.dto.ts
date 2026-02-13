import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  condition: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  discount: number;

  @IsDateString()
  start_time: string;

  @IsDateString()
  end_time: string;
}
