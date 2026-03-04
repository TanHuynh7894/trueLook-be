import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('rx_lens_specs')
export class RxLensSpec {
  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  product_id: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  material: string;

  @Column({ type: 'float', nullable: true })
  lens_width: number;

  @Column({ type: 'float', nullable: true })
  min_sphere: number;

  @Column({ type: 'float', nullable: true })
  max_sphere: number;

  @Column({ type: 'float', nullable: true })
  min_cylinder: number;

  @Column({ type: 'float', nullable: true })
  max_cylinder: number;

  @Column({ nullable: true })
  status: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
