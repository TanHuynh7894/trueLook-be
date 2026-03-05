import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Image } from '../../images/entities/image.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ name: 'product_id', type: 'varchar', length: 15 })
  product_id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar' })
  color: string;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'text' })
  description: string;

  @Column({
    name: 'create_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;

  @Column({ name: 'update_at', type: 'timestamp', nullable: true })
  update_at: Date;

  @Column({ type: 'varchar' })
  status: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @OneToMany(() => Image, (image) => image.variant) 
  images: Image[];

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.update_at = new Date();
  }
}
