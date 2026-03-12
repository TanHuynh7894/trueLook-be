import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderStatusDto } from './dto/update-order.dto';
import { Repository, DataSource } from 'typeorm';

import { Order } from './entities/order.entity';
import { User } from '../users/entities/user.entity';

import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { OrderDetail } from '../order_details/entities/order_detail.entity';

@Injectable()
export class OrdersService {

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,

    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,

    @InjectRepository(OrderDetail)
    private orderDetailRepository: Repository<OrderDetail>,

    private dataSource: DataSource,
  ) { }

  /**
   * CREATE ORDER (TEMP)
   */
  async create(createOrderDto: CreateOrderDto) {

    const customer = await this.usersRepository.findOneBy({
      id: createOrderDto.customer_id,
    });

    if (!customer) {
      throw new NotFoundException(
        `User with id ${createOrderDto.customer_id} not found`,
      );
    }

    return await this.dataSource.transaction(async manager => {

      const cart = await manager.findOne(Cart, {
        where: { user_id: createOrderDto.customer_id },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const cartItems = await manager.find(CartItem, {
        where: { cart_id: cart.id },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      let total = 0;

      const newOrder = this.ordersRepository.create({
        customer_id: createOrderDto.customer_id,
        total: 0,
        extra_fee: createOrderDto.extra_fee,
      });

      const savedOrder = await manager.save(newOrder);

      for (const item of cartItems) {

        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variant_id },
        });

        if (!variant) {
          throw new NotFoundException(
            `Variant with id ${item.variant_id} not found`,
          );
        }

        const price = Number(variant.price);
        const itemTotal = price * item.quantity;

        total += itemTotal;

        const orderDetail = this.orderDetailRepository.create({
          order_id: savedOrder.id,
          variant_id: variant.id,
          price: price,
          quantity: item.quantity,
        });

        await manager.save(orderDetail);
      }

      savedOrder.total = total + Number(createOrderDto.extra_fee);

      await manager.save(savedOrder);

      return savedOrder;
    });
  }

  /**
   * CONFIRM ORDER (PAYMENT SUCCESS)
   */
  async confirmOrder(orderId: string) {

    return await this.dataSource.transaction(async manager => {

      const order = await manager.findOne(Order, {
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException(`Order with id ${orderId} not found`);
      }

      const orderDetails = await manager.find(OrderDetail, {
        where: { order_id: orderId },
      });

      if (orderDetails.length === 0) {
        throw new BadRequestException('Order has no items');
      }

      /**
       * update stock
       */
      for (const item of orderDetails) {

        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variant_id },
        });

        if (!variant) {
          throw new NotFoundException(
            `Variant with id ${item.variant_id} not found`,
          );
        }

        if (variant.quantity < item.quantity) {
          throw new BadRequestException(
            `Product ${variant.name} not enough stock`,
          );
        }

        variant.quantity -= item.quantity;

        await manager.save(variant);
      }

      /**
       * clear cart
       */
      const cart = await manager.findOne(Cart, {
        where: { user_id: order.customer_id },
      });

      if (cart) {
        await manager.delete(CartItem, { cart_id: cart.id });
      }

      return {
        message: "Order confirmed",
        order_id: orderId,
      };
    });
  }

  /**
   * FIND ALL
   */
  async findAll() {
    return this.ordersRepository.find({
      order: {
        create_at: 'DESC',
      },
    });
  }

  /**
   * FIND ONE
   */
  async findOne(id: string) {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * UPDATE
   */
  async update(id: string, updateOrderDto: UpdateOrderDto) {

    await this.findOne(id);

    if (updateOrderDto.customer_id) {

      const customer = await this.usersRepository.findOneBy({
        id: updateOrderDto.customer_id,
      });

      if (!customer) {
        throw new NotFoundException(
          `User with id ${updateOrderDto.customer_id} not found`,
        );
      }
    }

    await this.ordersRepository.update(id, updateOrderDto);

    return this.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {

    const order = await this.ordersRepository.findOneBy({ id });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    const allowedStatus = ['Confirm', 'Shipping', 'Cancel'];

    if (!allowedStatus.includes(dto.status)) {
      throw new BadRequestException(
        `Status must be one of: ${allowedStatus.join(', ')}`
      );
    }

    order.status = dto.status;

    await this.ordersRepository.save(order);

    return {
      message: "Order status updated",
      order
    };
  }

  /**
   * DELETE
   */
  async remove(id: string) {

    const order = await this.ordersRepository.findOne({
      where: { id }
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    if (order.status === 'Cancel') {
      throw new BadRequestException('Order already cancelled');
    }

    order.status = 'Cancel';

    await this.ordersRepository.save(order);

    return {
      message: `Order ${id} has been cancelled`,
      order
    };
  }

  async getOrdersByUser(userId: string) {

    const orders = await this.ordersRepository.find({
      where: { customer_id: userId },
      order: { create_at: "DESC" }
    });

    if (orders.length === 0) {
      throw new NotFoundException(`No orders found for user ${userId}`);
    }

    return orders;
  }
}