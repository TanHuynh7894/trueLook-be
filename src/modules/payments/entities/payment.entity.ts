import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('payments')
export class Payment {
  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  order_id: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  status: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ type: 'timestamp', nullable: true })
  payment_date: Date;
}