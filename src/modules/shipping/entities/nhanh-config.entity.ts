import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nhanh_config')
export class NhanhConfig {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  access_token: string;

  @Column()
  business_id: number;

  @Column({ type: 'bigint' })
  expires_at: number;

  @CreateDateColumn()
  created_at: Date;
}