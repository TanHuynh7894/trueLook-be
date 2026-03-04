import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ name: 'customer_id', type: 'varchar', length: 15 })
  customer_id: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total: number;

  @Column({ name: 'extra_fee', type: 'numeric', precision: 12, scale: 2 })
  extra_fee: number;

  @Column({ name: 'update_at', type: 'timestamp', nullable: true })
  update_at: Date;

  @Column({
    name: 'create_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  create_at: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: User;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.update_at = new Date();
  }
}
