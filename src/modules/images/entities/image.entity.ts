import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { ProductVariant } from '../../product_variants/entities/product_variant.entity';

@Entity('images')
export class Image {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ name: 'variant_id', type: 'varchar', length: 15 })
  variant_id: string;

  @Column({ type: 'varchar' })
  path: string;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id', referencedColumnName: 'id' })
  variant: ProductVariant;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
