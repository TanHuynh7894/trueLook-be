import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  customer_id: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  total: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  extra_fee: number;
}
