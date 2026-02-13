import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('shipping_services')
export class ShippingService {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', unique: true })
  service_code: string;

  @Column({ type: 'varchar' })
  status: string;

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
