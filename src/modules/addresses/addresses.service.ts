import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createAddressDto: CreateAddressDto) {
    const user = await this.usersRepository.findOneBy({ id: createAddressDto.user_id });
    if (!user) {
      throw new NotFoundException(`User with id ${createAddressDto.user_id} not found`);
    }

    const newAddress = this.addressesRepository.create(createAddressDto);
    return await this.addressesRepository.save(newAddress);
  }

  findAll() {
    return this.addressesRepository.find();
  }

  async findOne(id: string) {
    const address = await this.addressesRepository.findOneBy({ id });
    if (!address) {
      throw new NotFoundException(`Address with id ${id} not found`);
    }
    return address;
  }

  async update(id: string, updateAddressDto: UpdateAddressDto) {
    if (updateAddressDto.user_id) {
      const user = await this.usersRepository.findOneBy({ id: updateAddressDto.user_id });
      if (!user) {
        throw new NotFoundException(`User with id ${updateAddressDto.user_id} not found`);
      }
    }

    await this.addressesRepository.update(id, updateAddressDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.addressesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Address with id ${id} not found for delete`);
    }
    return {
      message: `Deleted address with id: ${id}`,
      statusCode: 200,
    };
  }
}
