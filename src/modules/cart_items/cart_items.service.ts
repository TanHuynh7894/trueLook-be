import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
  ) {}

  async create(createCartItemDto: CreateCartItemDto) {
    const cart = await this.cartsRepository.findOneBy({ id: createCartItemDto.cart_id });
    if (!cart) {
      throw new NotFoundException(`Cart with id ${createCartItemDto.cart_id} not found`);
    }

    const variant = await this.productVariantsRepository.findOneBy({ id: createCartItemDto.variant_id });
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${createCartItemDto.variant_id} not found`);
    }

    const newCartItem = this.cartItemsRepository.create(createCartItemDto);
    return await this.cartItemsRepository.save(newCartItem);
  }

  findAll() {
    return this.cartItemsRepository.find();
  }

  async findOne(id: string) {
    const cartItem = await this.cartItemsRepository.findOneBy({ id });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with id ${id} not found`);
    }
    return cartItem;
  }

  async update(id: string, updateCartItemDto: UpdateCartItemDto) {
    await this.findOne(id);

    if (updateCartItemDto.cart_id) {
      const cart = await this.cartsRepository.findOneBy({ id: updateCartItemDto.cart_id });
      if (!cart) {
        throw new NotFoundException(`Cart with id ${updateCartItemDto.cart_id} not found`);
      }
    }

    if (updateCartItemDto.variant_id) {
      const variant = await this.productVariantsRepository.findOneBy({ id: updateCartItemDto.variant_id });
      if (!variant) {
        throw new NotFoundException(`Product variant with id ${updateCartItemDto.variant_id} not found`);
      }
    }

    await this.cartItemsRepository.update(id, updateCartItemDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.cartItemsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cart item with id ${id} not found for delete`);
    }
    return {
      message: `Deleted cart item with id: ${id}`,
      statusCode: 200,
    };
  }
}
