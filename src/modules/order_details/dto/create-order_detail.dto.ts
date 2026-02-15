import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateOrderDetailDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
