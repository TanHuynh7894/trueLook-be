import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('shipping')
export class Shipping {
  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  order_id: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  ship_fee: number;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  cod_amount: number;

  @CreateDateColumn()
  create_at: Date;

  @UpdateDateColumn({ nullable: true })
  update_at: Date;

  @Column({ nullable: true })
  status: string;

  @Column({ length: 15, nullable: true })
  provider_id: string;

  @Column({ length: 15, nullable: true })
  service_id: string;
}
