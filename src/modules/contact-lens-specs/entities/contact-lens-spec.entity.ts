import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('contact_lens_specs')
export class ContactLensSpec {
  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  product_id: string;

  @Column({ type: 'float', nullable: true })
  base_curve: number;

  @Column({ type: 'float', nullable: true })
  diameter: number;

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
