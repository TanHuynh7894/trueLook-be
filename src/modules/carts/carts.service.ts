import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
  ) {}
  async getCartByUserId(userId: string) {
    let cart = await this.cartsRepository.findOneBy({ user_id: userId });
    if (!cart) {
      const newCart = this.cartsRepository.create({ user_id: userId });
      cart = await this.cartsRepository.save(newCart);
    }
    return cart;
  }
}