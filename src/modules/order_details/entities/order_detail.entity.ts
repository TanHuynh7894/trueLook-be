import {
  BeforeInsert,
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { ProductVariant } from '../../product_variants/entities/product_variant.entity';

@Entity('order_details')
@Check(`"quantity" > 0`)
export class OrderDetail {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ name: 'order_id', type: 'varchar', length: 15 })
  order_id: string;

  @Column({ name: 'variant_id', type: 'varchar', length: 15 })
  variant_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Order, (order) => order.orderDetails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id', referencedColumnName: 'id' })
  variant: ProductVariant;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
