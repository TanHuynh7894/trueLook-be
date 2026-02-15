import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipping } from '../../shipping/entities/shipping.entity'; 
import { Payment } from '../../payments/entities/payment.entity';

@Entity('transitions')
export class Transition {
  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  shipping_id: string;

  @Column({ length: 15, nullable: true })
  payment_id: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  update_time: Date;

  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => Shipping, (shipping) => shipping.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipping_id' })
  shipping: Shipping;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;
}