import { Entity, Column, PrimaryColumn, BeforeInsert, OneToMany } from 'typeorm';
import { UserRole } from '../../user_roles/entities/user_role.entity';

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

  @Column({ type: 'varchar', nullable: true })
  gender: string;

  @Column()
  email: string;

  @Column({ type: 'timestamp', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken: string | null;

  @Column({ type: 'text', nullable: true, name: 'reset_otp' })
  resetOtp: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'reset_otp_expires' })
  resetOtpExpires: Date | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
