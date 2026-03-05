import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { CartItem } from './entities/cart_item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';

@Injectable()
export class CartItemsService {
  private readonly deepRelations = [
    'variant',                        
    'variant.images',               
    'variant.product',                
    'variant.product.brand',         
    'variant.product.categories',     
  ];

  constructor(
    @InjectRepository(CartItem)
    private cartItemsRepo: Repository<CartItem>,
    @InjectRepository(Cart)
    private cartsRepo: Repository<Cart>,
    @InjectRepository(ProductVariant)
    private productVariantsRepo: Repository<ProductVariant>,
  ) {}

  async addItem(userId: string, createCartItemDto: CreateCartItemDto) {
    const { variant_id, quantity } = createCartItemDto;

    let cart = await this.cartsRepo.findOneBy({ user_id: userId });
    if (!cart) {
      cart = this.cartsRepo.create({ user_id: userId });
      await this.cartsRepo.save(cart);
    }

    const variant = await this.productVariantsRepo.findOneBy({ id: variant_id });
    if (!variant) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${variant_id}`);
    }

    const existingItem = await this.cartItemsRepo.findOneBy({
      cart_id: cart.id,
      variant_id: variant_id,
    });

    let savedItem;
    if (existingItem) {
      existingItem.quantity += quantity;
      savedItem = await this.cartItemsRepo.save(existingItem);
    } else {
      const newItem = this.cartItemsRepo.create({
        cart_id: cart.id,
        variant_id: variant_id,
        quantity: quantity,
      });
      savedItem = await this.cartItemsRepo.save(newItem);
    }

    return await this.cartItemsRepo.findOne({
      where: { id: savedItem.id },
      relations: this.deepRelations, 
    });
  }

  async getMyCartItems(userId: string) {
    const cart = await this.cartsRepo.findOneBy({ user_id: userId });
    if (!cart) {
      return []; 
    }

    return await this.cartItemsRepo.find({
      where: { cart_id: cart.id },
      relations: this.deepRelations, 
    });
  }

  async updateQuantity(id: string, updateCartItemDto: UpdateCartItemDto) {
    const cartItem = await this.cartItemsRepo.findOne({
      where: { id },
      relations: this.deepRelations, 
    });

    if (!cartItem) {
      throw new NotFoundException(`Không tìm thấy sản phẩm trong giỏ (ID: ${id})`);
    }

    if (updateCartItemDto.quantity !== undefined) {
      cartItem.quantity = updateCartItemDto.quantity;
      await this.cartItemsRepo.save(cartItem);
    }

    return cartItem;
  }

  async remove(id: string) {
    const result = await this.cartItemsRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy sản phẩm để xóa (ID: ${id})`);
    }
    return {
      message: 'Đã xóa sản phẩm khỏi giỏ hàng!',
      statusCode: 200,
    };
  }
}