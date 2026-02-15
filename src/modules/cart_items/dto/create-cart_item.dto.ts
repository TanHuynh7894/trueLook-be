import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateCartItemDto {
  @IsString()
  @IsNotEmpty()
  cart_id: string;

  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;
}
