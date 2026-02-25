import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    // 1. Tách password ra khỏi phần dữ liệu còn lại
    const { password, ...restData } = createUserDto;

    // 2. Hash cái password đó (10 vòng salt là chuẩn bài)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Nhét password đã hash vào lại object để tạo Entity
    const newUser = this.usersRepository.create({
      ...restData,
      password: hashedPassword,
    });

    // 4. Lưu xuống Database
    return await this.usersRepository.save(newUser);
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy user có id: ${id}`);
    }
    return user;
  }

  async findOneWithRoles(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException(`Khong tim thay user co id: ${id}`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy user có id: ${id} để xóa`);
    }
    return {
      message: `Đã xóa thành công user có id: ${id}`,
      statusCode: 200
    };
  }

  async findOneByUsername(username: string) {
    return await this.usersRepository.findOne({
      where: { username },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
    await this.usersRepository.update(id, { refreshToken: hashedToken });
  }

  async updatePassword(id: string, hashedPass: string) {
    await this.usersRepository.update(id, { password: hashedPass });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOneBy({ email });
  }

  async findOneByEmailWithRoles(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });
  }

  async saveResetOtp(userId: string, otp: string, expiresAt: Date) {
    await this.usersRepository.update(userId, {
      resetOtp: otp,
      resetOtpExpires: expiresAt
    });
  }

  async clearResetOtp(userId: string) {
    await this.usersRepository.update(userId, {
      resetOtp: null,
      resetOtpExpires: null
    });
  }

}
