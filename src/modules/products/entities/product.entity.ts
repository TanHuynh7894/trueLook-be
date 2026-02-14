import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';

@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ name: 'product_type', type: 'varchar' })
  product_type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'create_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_at: Date;

  @Column({ name: 'update_at', type: 'timestamp', nullable: true })
  update_at: Date;

  @Column({ name: 'status', type: 'varchar' })
  status: string;

  @Column({ name: 'brand_id', type: 'varchar', length: 15 })
  brand_id: string;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id', referencedColumnName: 'id' })
  brand: Brand;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.update_at = new Date();
  }
}
