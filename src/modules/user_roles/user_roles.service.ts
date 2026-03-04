import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user_role.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    const user = await this.usersRepository.findOneBy({
      id: createUserRoleDto.user_id,
    });
    if (!user)
      throw new NotFoundException(
        `User with id ${createUserRoleDto.user_id} not found`,
      );

    const role = await this.rolesRepository.findOneBy({
      id: createUserRoleDto.role_id,
    });
    if (!role)
      throw new NotFoundException(
        `Role with id ${createUserRoleDto.role_id} not found`,
      );

    const existingUserRole = await this.userRolesRepository.findOneBy({
      user_id: createUserRoleDto.user_id,
      role_id: createUserRoleDto.role_id,
    });
    if (existingUserRole) {
      throw new ConflictException(
        `User role (${createUserRoleDto.user_id}, ${createUserRoleDto.role_id}) already exists`,
      );
    }

    const newUserRole = this.userRolesRepository.create(createUserRoleDto);
    return await this.userRolesRepository.save(newUserRole);
  }

  async findAll() {
    // 1. Lấy toàn bộ dữ liệu phẳng từ Database
    const userRoles = await this.userRolesRepository.find({
      relations: ['user', 'role'],
      select: {
        user_id: true,
        role_id: true,
        user: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          status: true,
        },
        role: {
          id: true,
          name: true,
        },
      },
    });

    // 2. Dùng reduce để gom nhóm theo userId
    const grouped = userRoles.reduce((acc, current) => {
      const userId = current.user_id;

      // Nếu chưa có user này trong danh sách gom nhóm thì tạo mới
      if (!acc[userId]) {
        acc[userId] = {
          ...current.user,
          roles: [], // Khởi tạo mảng roles trống
        };
      }

      // Đẩy role của dòng hiện tại vào mảng roles của user đó
      if (current.role) {
        acc[userId].roles.push(current.role);
      }

      return acc;
    }, {});

    // 3. Trả về mảng các Object đã được gom nhóm (chuyển từ Object sang Array)
    return Object.values(grouped);
  }

  async findOne(userId: string, roleId: string) {
    const userRole = await this.userRolesRepository.findOne({
      where: { user_id: userId, role_id: roleId },
      relations: ['user', 'role'],
      select: {
        user_id: true,
        role_id: true,
        user: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          status: true,
        },
        role: {
          id: true,
          name: true,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException(`User role (${userId}, ${roleId}) not found`);
    }
    return userRole;
  }

  async remove(userId: string, roleId: string) {
    const result = await this.userRolesRepository.delete({
      user_id: userId,
      role_id: roleId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `User role (${userId}, ${roleId}) not found for delete`,
      );
    }
    return {
      message: `Deleted user role (${userId}, ${roleId})`,
      statusCode: 200,
    };
  }

  async assignRoleByName(userId: string, roleName: string) {
    const role = await this.rolesRepository.findOneBy({ name: roleName });
    if (!role)
      throw new NotFoundException(
        `Role với tên "${roleName}" không tồn tại trong hệ thống!`,
      );

    const existingUserRole = await this.userRolesRepository.findOneBy({
      user_id: userId,
      role_id: role.id,
    });
    if (existingUserRole) return existingUserRole;

    const newUserRole = this.userRolesRepository.create({
      user_id: userId,
      role_id: role.id,
    });
    return await this.userRolesRepository.save(newUserRole);
  }

  async syncRoles(userId: string, roleIds: string[]) {
    await this.userRolesRepository.delete({ user_id: userId });
    if (!roleIds || roleIds.length === 0) return;

    const newRoles = roleIds.map((roleId) => ({
      user_id: userId,
      role_id: roleId,
    }));
    await this.userRolesRepository.save(newRoles);
  }

  async getRolesOfUser(userId: string) {
    const userRoles = await this.userRolesRepository.find({
      where: { user_id: userId },
      relations: ['user', 'role'],
      select: {
        user_id: true,
        role_id: true,
        user: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          status: true,
        },
        role: {
          id: true,
          name: true,
        },
      },
    });

    // Nếu user chưa có quyền nào
    if (!userRoles || userRoles.length === 0) {
      return { message: 'Nhân viên này chưa được cấp quyền nào!', roles: [] };
    }

    const userInfo = userRoles[0].user; // Lấy thông tin user từ dòng đầu tiên làm chuẩn
    const rolesList = userRoles.map((ur) => ur.role); // Quét qua mảng, nhặt mỗi cái 'role' gom lại

    // Trả về một object duy nhất, phẳng và đẹp
    return {
      id: userInfo.id,
      username: userInfo.username,
      fullName: userInfo.fullName,
      email: userInfo.email,
      status: userInfo.status,
      roles: rolesList,
    };
  }
}
