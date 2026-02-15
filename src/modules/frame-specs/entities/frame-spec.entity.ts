import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('frame_specs')
export class FrameSpec {
  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  product_id: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  material: string;

  @Column({ type: 'float', nullable: true })
  a: number;

  @Column({ type: 'float', nullable: true })
  b: number;

  @Column({ type: 'float', nullable: true })
  dbl: number;

  @Column({ nullable: true })
  shape: string;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  status: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}