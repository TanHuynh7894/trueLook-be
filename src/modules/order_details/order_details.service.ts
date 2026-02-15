import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order_detail.dto';
import { Repository } from 'typeorm';
import { OrderDetail } from './entities/order_detail.entity';
import { Order } from '../orders/entities/order.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private orderDetailsRepository: Repository<OrderDetail>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
  ) {}

  async create(createOrderDetailDto: CreateOrderDetailDto) {
    const order = await this.ordersRepository.findOneBy({ id: createOrderDetailDto.order_id });
    if (!order) {
      throw new NotFoundException(`Order with id ${createOrderDetailDto.order_id} not found`);
    }

    const variant = await this.productVariantsRepository.findOneBy({ id: createOrderDetailDto.variant_id });
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${createOrderDetailDto.variant_id} not found`);
    }

    const newOrderDetail = this.orderDetailsRepository.create(createOrderDetailDto);
    return await this.orderDetailsRepository.save(newOrderDetail);
  }

  findAll() {
    return this.orderDetailsRepository.find();
  }

  async findOne(id: string) {
    const orderDetail = await this.orderDetailsRepository.findOneBy({ id });
    if (!orderDetail) {
      throw new NotFoundException(`Order detail with id ${id} not found`);
    }
    return orderDetail;
  }

  async update(id: string, updateOrderDetailDto: UpdateOrderDetailDto) {
    await this.findOne(id);

    if (updateOrderDetailDto.order_id) {
      const order = await this.ordersRepository.findOneBy({ id: updateOrderDetailDto.order_id });
      if (!order) {
        throw new NotFoundException(`Order with id ${updateOrderDetailDto.order_id} not found`);
      }
    }

    if (updateOrderDetailDto.variant_id) {
      const variant = await this.productVariantsRepository.findOneBy({ id: updateOrderDetailDto.variant_id });
      if (!variant) {
        throw new NotFoundException(`Product variant with id ${updateOrderDetailDto.variant_id} not found`);
      }
    }

    await this.orderDetailsRepository.update(id, updateOrderDetailDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.orderDetailsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order detail with id ${id} not found for delete`);
    }
    return {
      message: `Deleted order detail with id: ${id}`,
      statusCode: 200,
    };
  }
}
