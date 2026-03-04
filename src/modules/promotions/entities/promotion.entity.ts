import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  condition: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  discount: number;

  @Column({ name: 'start_time', type: 'timestamp' })
  start_time: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  end_time: Date;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  status: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = Date.now().toString();
    }
  }
}