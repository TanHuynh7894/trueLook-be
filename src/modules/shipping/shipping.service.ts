import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipping } from './entities/shipping.entity';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import axios from 'axios';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipping)
    private shippingRepo: Repository<Shipping>,
  ) { }

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

  async getAccessToken() {
    try {
      const res = await axios.post(
        'https://open.nhanh.vn/api/oauth/token',
        {
          appId: process.env.NHANH_APP_ID,
          secretKey: process.env.NHANH_APP_SECRET,
        }
      );

      console.log('Nhanh response:', res.data);
     

      return res.data;
    } catch (error) {
      console.error(
        'Nhanh API error:',
        error.response?.data || error.message,
         console.log('AppId:', process.env.NHANH_APP_ID),
      console.log('Secret:', process.env.NHANH_APP_SECRET),
      );

      throw error;
    }
  }
}
