import { Injectable } from '@nestjs/common';
import { CreateShippingProviderDto } from './dto/create-shipping_provider.dto';
import { UpdateShippingProviderDto } from './dto/update-shipping_provider.dto';

@Injectable()
export class ShippingProvidersService {
  create(createShippingProviderDto: CreateShippingProviderDto) {
    return 'This action adds a new shippingProvider';
  }

  findAll() {
    return `This action returns all shippingProviders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shippingProvider`;
  }

  update(id: number, updateShippingProviderDto: UpdateShippingProviderDto) {
    return `This action updates a #${id} shippingProvider`;
  }

  remove(id: number) {
    return `This action removes a #${id} shippingProvider`;
  }
}
