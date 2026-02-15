import { Module } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from './entities/cart_item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Cart, ProductVariant])],
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}
