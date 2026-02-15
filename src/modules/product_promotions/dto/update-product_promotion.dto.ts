import { PartialType } from '@nestjs/mapped-types';
import { CreateProductPromotionDto } from './create-product_promotion.dto';

export class UpdateProductPromotionDto extends PartialType(CreateProductPromotionDto) {}
