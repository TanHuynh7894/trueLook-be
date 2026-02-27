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

  async findAll() {
    return this.usersRepository.find({ 
      relations: ['userRoles.role'],        
      select: ['id', 'username', 'email', 'fullName', 'gender', 'birthday', 'status']
    });                               
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['userRoles.role'], 
      select: ['id', 'username', 'email', 'fullName', 'password', 'gender', 'birthday', 'status']
    });            
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
    // 1. Tách password ra (nếu người dùng cố tình gửi lên) và bỏ đi, chỉ lấy phần dữ liệu an toàn (safeData)
    const { password, ...safeData } = updateUserDto as any; 

    // 2. Chỉ update những trường an toàn
    await this.usersRepository.update(id, safeData);
    return this.findOne(id);
  }

  async remove(id: string) {
    // 1. Kiểm tra xem user có tồn tại không
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Không tìm thấy tài khoản với ID: ${id}`);
    }

    // 2. Thực hiện Soft Delete: Cập nhật status = 0
    await this.usersRepository.update(id, { status: 0 });

    // 3. Trả về thông báo cho đẹp
    return {
      statusCode: 200,
      message: `Đã khóa (xóa mềm) tài khoản ${user.username} thành công!`,
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

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role'],
      select: ['id', 'username', 'email', 'fullName', 'gender', 'birthday', 'status'], 
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng!');
    }
    return user;
  }

}
