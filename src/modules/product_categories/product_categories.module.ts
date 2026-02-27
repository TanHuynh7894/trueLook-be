import { Module } from '@nestjs/common';
import { ProductCategoriesService } from './product_categories.service';
import { ProductCategoriesAdminController, ProductCategoriesController } from './product_categories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product_category.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory, Product, Category])],
  controllers: [ProductCategoriesController, ProductCategoriesAdminController],
  providers: [ProductCategoriesService],
})
export class ProductCategoriesModule {}
