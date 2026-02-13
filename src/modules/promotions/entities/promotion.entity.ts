import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column()
  condition: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  discount: number;

  @Column({ name: 'start_time', type: 'timestamp' })
  start_time: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  end_time: Date;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
