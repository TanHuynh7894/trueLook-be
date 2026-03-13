import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  OneToMany,
  Check,
} from 'typeorm';
import { UserRole } from '../../user_roles/entities/user_role.entity';
import { Address } from 'src/modules/addresses/entities/address.entity';

@Entity('users')
@Check(`"status" IN (0, 1)`)
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

  @Column({ type: 'int', default: 1 }) // Mặc định là 1 (Hoạt động)
  status: number;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
