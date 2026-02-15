import { Module } from '@nestjs/common';
import { ProductPromotionsService } from './product_promotions.service';
import { ProductPromotionsController } from './product_promotions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPromotion } from './entities/product_promotion.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { Promotion } from '../promotions/entities/promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductPromotion, ProductVariant, Promotion])],
  controllers: [ProductPromotionsController],
  providers: [ProductPromotionsService],
})
export class ProductPromotionsModule {}
