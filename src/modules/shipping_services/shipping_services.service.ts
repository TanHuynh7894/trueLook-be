import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateShippingServiceDto } from './dto/create-shipping_service.dto';
import { UpdateShippingServiceDto } from './dto/update-shipping_service.dto';
import { Repository } from 'typeorm';
import { ShippingService } from './entities/shipping_service.entity';

@Injectable()
export class ShippingServicesService {
  constructor(
    @InjectRepository(ShippingService)
    private shippingServicesRepository: Repository<ShippingService>,
  ) {}

  async create(createShippingServiceDto: CreateShippingServiceDto) {
    const newShippingService = this.shippingServicesRepository.create(
      createShippingServiceDto,
    );
    return await this.shippingServicesRepository.save(newShippingService);
  }

  findAll() {
    return this.shippingServicesRepository.find();
  }

  async findOne(id: string) {
    const shippingService = await this.shippingServicesRepository.findOneBy({
      id,
    });
    if (!shippingService) {
      throw new NotFoundException(`Shipping service with id ${id} not found`);
    }
    return shippingService;
  }

  async update(id: string, updateShippingServiceDto: UpdateShippingServiceDto) {
    await this.shippingServicesRepository.update(id, updateShippingServiceDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.shippingServicesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Shipping service with id ${id} not found for delete`,
      );
    }
    return {
      message: `Deleted shipping service with id: ${id}`,
      statusCode: 200,
    };
  }
}
