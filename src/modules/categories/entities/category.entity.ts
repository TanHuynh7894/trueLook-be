import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column()
  name: string;

  @Column()
  status: string;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
