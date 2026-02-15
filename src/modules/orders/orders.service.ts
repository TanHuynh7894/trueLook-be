import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const customer = await this.usersRepository.findOneBy({ id: createOrderDto.customer_id });
    if (!customer) {
      throw new NotFoundException(`User with id ${createOrderDto.customer_id} not found`);
    }

    const newOrder = this.ordersRepository.create(createOrderDto);
    return await this.ordersRepository.save(newOrder);
  }

  findAll() {
    return this.ordersRepository.find();
  }

  async findOne(id: string) {
    const order = await this.ordersRepository.findOneBy({ id });
    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);

    if (updateOrderDto.customer_id) {
      const customer = await this.usersRepository.findOneBy({ id: updateOrderDto.customer_id });
      if (!customer) {
        throw new NotFoundException(`User with id ${updateOrderDto.customer_id} not found`);
      }
    }

    await this.ordersRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.ordersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Order with id ${id} not found for delete`);
    }
    return {
      message: `Deleted order with id: ${id}`,
      statusCode: 200,
    };
  }
}
