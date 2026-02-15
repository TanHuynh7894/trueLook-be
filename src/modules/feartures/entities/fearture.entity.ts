import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RxLensSpec } from '../../rx-lens-specs/entities/rx-lens-spec.entity';

@Entity('features')
export class Feature {
  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  rx_lens_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  status: string;

  @ManyToOne(() => RxLensSpec, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rx_lens_id' })
  rxLens: RxLensSpec;
}