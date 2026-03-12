import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';

import { Payment } from './entities/payment.entity';
import { Transition } from '../transitions/entities/transition.entity';

import { Order } from '../orders/entities/order.entity';
import { OrderDetail } from '../order_details/entities/order_detail.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      Transition,
      Order,
      OrderDetail,
      ProductVariant,
      Cart,
      CartItem,
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}