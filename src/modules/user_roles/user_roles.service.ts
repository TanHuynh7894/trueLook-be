import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { UpdateUserRoleDto } from './dto/update-user_role.dto';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user_role.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private userRolesRepository: Repository<UserRole>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserRoleDto: CreateUserRoleDto) {
    const user = await this.usersRepository.findOneBy({ id: createUserRoleDto.user_id });
    if (!user) {
      throw new NotFoundException(`User with id ${createUserRoleDto.user_id} not found`);
    }

    const role = await this.rolesRepository.findOneBy({ id: createUserRoleDto.role_id });
    if (!role) {
      throw new NotFoundException(`Role with id ${createUserRoleDto.role_id} not found`);
    }

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

  findAll() {
    return this.userRolesRepository.find();
  }

  async findOne(userId: string, roleId: string) {
    const userRole = await this.userRolesRepository.findOneBy({
      user_id: userId,
      role_id: roleId,
    });
    if (!userRole) {
      throw new NotFoundException(`User role (${userId}, ${roleId}) not found`);
    }
    return userRole;
  }

  async update(userId: string, roleId: string, updateUserRoleDto: UpdateUserRoleDto) {
    await this.userRolesRepository.update(
      { user_id: userId, role_id: roleId },
      updateUserRoleDto,
    );

    const nextUserId = updateUserRoleDto.user_id ?? userId;
    const nextRoleId = updateUserRoleDto.role_id ?? roleId;
    return this.findOne(nextUserId, nextRoleId);
  }

  async remove(userId: string, roleId: string) {
    const result = await this.userRolesRepository.delete({
      user_id: userId,
      role_id: roleId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`User role (${userId}, ${roleId}) not found for delete`);
    }
    return {
      message: `Deleted user role (${userId}, ${roleId})`,
      statusCode: 200,
    };
  }

  async assignRoleByName(userId: string, roleName: string) {
    // 1. Tìm Role dựa trên tên (ví dụ: 'Customer')
    const role = await this.rolesRepository.findOneBy({ name: roleName });
    if (!role) {
      throw new NotFoundException(`Role với tên "${roleName}" không tồn tại trong hệ thống!`);
    }

    // 2. Kiểm tra xem User đã có quyền này chưa để tránh lỗi trùng lặp
    const existingUserRole = await this.userRolesRepository.findOneBy({
      user_id: userId,
      role_id: role.id,
    });

    if (existingUserRole) {
      return existingUserRole;
    }

    // 3. Tạo mới bản ghi trong bảng trung gian user_roles
    const newUserRole = this.userRolesRepository.create({
      user_id: userId,
      role_id: role.id,
    });

    return await this.userRolesRepository.save(newUserRole);
  }
}
