import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity('carts')
export class Cart {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 15, unique: true })
  user_id: string;

  @ApiHideProperty() 
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = Date.now().toString();
    }
  }
}