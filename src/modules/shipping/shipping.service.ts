import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping } from './entities/shipping.entity';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private shippingRepo: Repository<Shipping>,
  ) {}

  async create(dto: CreateShippingDto): Promise<Shipping> {
    const newShipping = this.shippingRepo.create(dto);
    return await this.shippingRepo.save(newShipping);
  }

  async findAll(): Promise<Shipping[]> {
    return await this.shippingRepo.find();
  }

  async findOne(id: string): Promise<Shipping> {
    const shipping = await this.shippingRepo.findOneBy({ id });
    if (!shipping) {
      throw new NotFoundException(`Shipping với ID ${id} không tồn tại`);
    }
    return shipping;
  }

  async update(id: string, dto: UpdateShippingDto): Promise<Shipping> {
    const shipping = await this.findOne(id);
    const updated = Object.assign(shipping, dto);
    return await this.shippingRepo.save(updated);
  }

  async remove(id: string): Promise<{ message: string }> {
    const shipping = await this.findOne(id);
    await this.shippingRepo.remove(shipping);
    return { message: `Đã xóa thành công vận đơn ${id}` };
  }
}
