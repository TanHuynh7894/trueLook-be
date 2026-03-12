import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 15, name: 'order_id' })
  orderId: string;

  @Column({ type: 'varchar', length: 15, name: 'customer_id' })
  customerId: string;

  @Column({ type: 'varchar', length: 20, default: 'open' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ChatMessage, (message) => message.ticket)
  messages: ChatMessage[];
}