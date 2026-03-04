import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createCartDto: CreateCartDto) {
    const user = await this.usersRepository.findOneBy({
      id: createCartDto.user_id,
    });
    if (!user) {
      throw new NotFoundException(
        `User with id ${createCartDto.user_id} not found`,
      );
    }

    const existingCart = await this.cartsRepository.findOneBy({
      user_id: createCartDto.user_id,
    });
    if (existingCart) {
      throw new ConflictException(
        `Cart for user_id ${createCartDto.user_id} already exists`,
      );
    }

    const newCart = this.cartsRepository.create(createCartDto);
    return await this.cartsRepository.save(newCart);
  }

  findAll() {
    return this.cartsRepository.find();
  }

  async findOne(id: string) {
    const cart = await this.cartsRepository.findOneBy({ id });
    if (!cart) {
      throw new NotFoundException(`Cart with id ${id} not found`);
    }
    return cart;
  }

  async update(id: string, updateCartDto: UpdateCartDto) {
    const cart = await this.findOne(id);

    if (updateCartDto.user_id && updateCartDto.user_id !== cart.user_id) {
      const user = await this.usersRepository.findOneBy({
        id: updateCartDto.user_id,
      });
      if (!user) {
        throw new NotFoundException(
          `User with id ${updateCartDto.user_id} not found`,
        );
      }

      const existingCart = await this.cartsRepository.findOneBy({
        user_id: updateCartDto.user_id,
      });
      if (existingCart && existingCart.id !== id) {
        throw new ConflictException(
          `Cart for user_id ${updateCartDto.user_id} already exists`,
        );
      }
    }

    await this.cartsRepository.update(id, updateCartDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.cartsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cart with id ${id} not found for delete`);
    }
    return {
      message: `Deleted cart with id: ${id}`,
      statusCode: 200,
    };
  }
}
