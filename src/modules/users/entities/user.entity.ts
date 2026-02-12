import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';

@Entity('users')
export class User {

  @PrimaryColumn({ type: 'varchar', length: 15 }) 
  id: string;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ name: 'full_name' }) 
  fullName: string;

  @Column()
  gender: string;

  @Column()
  email: string;

  @Column({ type: 'timestamp' })
  birthday: Date;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
