import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Brand } from '../brands/entities/brand.entity';
import { ProductCategory } from '../product_categories/entities/product_category.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { Image } from '../images/entities/image.entity';
import { FrameSpec } from '../frame-specs/entities/frame-spec.entity';
import { RxLensSpec } from '../rx-lens-specs/entities/rx-lens-spec.entity';
import { ContactLensSpec } from '../contact-lens-specs/entities/contact-lens-spec.entity';
import { Category } from '../categories/entities/category.entity';
import { Feature } from '../feartures/entities/fearture.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Brand,
      ProductCategory,
      ProductVariant,
      Image,
      FrameSpec,
      RxLensSpec,
      ContactLensSpec,
      Category,
      Feature,
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
