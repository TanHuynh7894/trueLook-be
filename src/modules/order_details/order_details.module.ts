import { Module } from '@nestjs/common';
import { OrderDetailsService } from './order_details.service';
import { OrderDetailsController } from './order_details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { Order } from '../orders/entities/order.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail, Order, ProductVariant])],
  controllers: [OrderDetailsController],
  providers: [OrderDetailsService],
})
export class OrderDetailsModule {}
