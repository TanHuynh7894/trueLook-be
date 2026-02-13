import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('shipping_providers')
export class ShippingProvider {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', unique: true })
  code: string;

  @Column()
  status: string;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
