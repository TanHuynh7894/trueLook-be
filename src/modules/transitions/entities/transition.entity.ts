import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Shipping } from '../../shipping/entities/shipping.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('transitions')
export class Transition {

  @PrimaryColumn({ length: 15 })
  id: string;

  @Column({ length: 15 })
  shipping_id: string;

  @Column({ length: 15 })
  payment_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transition_shipping: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transition_payment: string;

  @Column({ type: 'timestamp', nullable: true })
  create_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  update_time: Date;

  @ManyToOne(() => Shipping, (shipping) => shipping.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipping_id' })
  shipping: Shipping;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;
}