import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('payments')
export class Payment {

  @PrimaryColumn({
    type: 'varchar',
    length: 40,
  })
  id: string; // payment id

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  method: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  status: string;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  payment_date: Date;

  @Column({
    type: 'varchar',
    length: 40,
  })
  order_id: string;

}