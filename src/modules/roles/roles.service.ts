import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    // Kiểm tra trùng lặp
    const existingRole = await this.rolesRepository.findOneBy({
      name: createRoleDto.name,
    });
    if (existingRole) {
      throw new ConflictException(`Role '${createRoleDto.name}' đã tồn tại!`);
    }

    const newRole = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(newRole);
  }

  findAll() {
    return this.rolesRepository.find();
  }

  async findOne(id: string) {
    const role = await this.rolesRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`Không tìm thấy role có id: ${id}`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy role có id: ${id} để xóa`);
    }
    return {
      message: `Đã xóa thành công role có id: ${id}`,
      statusCode: 200,
    };
  }
}
