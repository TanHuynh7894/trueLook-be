import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../../user_roles/entities/user_role.entity';

@Entity('roles')
export class Role {
  @PrimaryColumn({ type: 'varchar', length: 15 })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @BeforeInsert()
  generateId() {
    this.id = Date.now().toString();
  }
}
