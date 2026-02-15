import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Cart } from '../../carts/entities/cart.entity';
import { ProductVariant } from '../../product_variants/entities/product_variant.entity';

@Entity('cart_items')
@Check(`"quantity" > 0`)
export class CartItem {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ name: 'cart_id', type: 'varchar', length: 15 })
  cart_id: string;

  @Column({ name: 'variant_id', type: 'varchar', length: 15 })
  variant_id: string;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Cart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: Cart;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id', referencedColumnName: 'id' })
  variant: ProductVariant;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
