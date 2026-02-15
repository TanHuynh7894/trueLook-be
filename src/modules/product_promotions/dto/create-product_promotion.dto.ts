import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductPromotionDto {
  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @IsString()
  @IsNotEmpty()
  promotion_id: string;
}
