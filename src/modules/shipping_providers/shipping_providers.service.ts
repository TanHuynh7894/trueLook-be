import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShippingProviderDto } from './dto/create-shipping_provider.dto';
import { UpdateShippingProviderDto } from './dto/update-shipping_provider.dto';
import { Repository } from 'typeorm';
import { ShippingProvider } from './entities/shipping_provider.entity';

@Injectable()
export class ShippingProvidersService {
  constructor(
    @InjectRepository(ShippingProvider)
    private shippingProvidersRepository: Repository<ShippingProvider>,
  ) {}

  async create(createShippingProviderDto: CreateShippingProviderDto) {
    const newShippingProvider = this.shippingProvidersRepository.create(createShippingProviderDto);
    return await this.shippingProvidersRepository.save(newShippingProvider);
  }

  findAll() {
    return this.shippingProvidersRepository.find();
  }

  async findOne(id: string) {
    const shippingProvider = await this.shippingProvidersRepository.findOneBy({ id });
    if (!shippingProvider) {
      throw new NotFoundException(`Shipping provider with id ${id} not found`);
    }
    return shippingProvider;
  }

  async update(id: string, updateShippingProviderDto: UpdateShippingProviderDto) {
    await this.shippingProvidersRepository.update(id, updateShippingProviderDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.shippingProvidersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Shipping provider with id ${id} not found for delete`);
    }
    return {
      message: `Deleted shipping provider with id: ${id}`,
      statusCode: 200,
    };
  }
}
