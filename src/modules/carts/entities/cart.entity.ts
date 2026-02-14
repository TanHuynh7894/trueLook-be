import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('carts')
export class Cart {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 15, unique: true })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
