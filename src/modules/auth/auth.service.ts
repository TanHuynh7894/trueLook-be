import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { UserRolesService } from '../user_roles/user_roles.service';
import { CreateUserDto } from '../users/dto/create-user.dto';


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private userRolesService: UserRolesService,
  ) {}

  async signIn(username: string, pass: string) {
    // 1. Tìm user trong database (đã lấy kèm mảng userRoles nhờ hàm findOneByUsername mới sửa)
    const user = await this.usersService.findOneByUsername(username);
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại!');

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Mật khẩu không chính xác!');

    // 3. Trích xuất danh sách tên quyền (Ví dụ: ['Customer'])
    const roles = user.userRoles?.map((ur) => ur.role.name) || [];

    // 4. Tạo Payload cho JWT (Phải có roles thì Guard mới chạy được)
    const payload = { 
      sub: user.id, 
      username: user.username,
      fullName: user.fullName,
      roles: roles
    };

    // 5. TẠO CÙNG LÚC 2 TOKEN (Access & Refresh)
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'SECRET_KEY',
        expiresIn: '15m', 
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY',
        expiresIn: '7d', 
      }),
    ]);

    // 6. Lưu Refresh Token xuống DB
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    // 7. Lọc bỏ các thông tin nhạy cảm trước khi trả về Frontend
    const { password, refreshToken: rt, resetOtp, resetOtpExpires, userRoles, ...fullUserInfo } = user;

    // 8. Trả về cho Client
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        ...fullUserInfo, 
        roles: roles 
      }
    };
  }

  async refreshTokens(userId: string, rt: string) {
    // Tìm user theo ID (trong users.service.ts ông có sẵn hàm findOne rồi)
    const user = await this.usersService.findOne(userId); 
    
    // Nếu không có user hoặc user đã bị xóa refresh_token (do đăng xuất)
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Truy cập bị từ chối!');
    }

    // So sánh chuỗi token client gửi lên với chuỗi token đã hash trong DB
    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) {
      throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã bị thu hồi!');
    }

    // NẾU HỢP LỆ -> TẠO LẠI 2 TOKEN MỚI TOANH
    const payload = { sub: user.id, username: user.username, fullName: user.fullName };
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'SECRET_KEY',
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY',
        expiresIn: '7d',
      }),
    ]);

    // Cập nhật lại token mới vào DB
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(userId: string) {
    // Xóa refresh_token trong Database bằng cách set nó về null
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Đăng xuất thành công, đã thu hồi Token!' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống!');
    }

    // Tạo mã OTP 6 số ngẫu nhiên (từ 100000 đến 999999)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set thời gian hết hạn là 15 phút tính từ hiện tại
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Lưu OTP vào Database
    await this.usersService.saveResetOtp(user.id, otp, expiresAt);

    // In ra console để test (Thực tế ông sẽ gửi mail chứa biến otp này)
    console.log(`[TEST] Mã OTP của user ${email} là: ${otp}`);
    await this.mailerService.sendMail({
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu - True Look',
      html: `<b>Mã OTP của bạn là: ${otp}</b>`,
    });
    return { message: 'Mã xác nhận 6 số đã được gửi đến email của bạn!' };
  }

  async resetPassword(email: string, otp: string, newPass: string) {
    const user = await this.usersService.findOneByEmail(email);
    
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      throw new BadRequestException('Yêu cầu không hợp lệ!');
    }

    // 1. Kiểm tra thời gian hết hạn
    if (new Date() > user.resetOtpExpires) {
      throw new BadRequestException('Mã OTP đã hết hạn, vui lòng yêu cầu mã mới!');
    }

    // 2. Kiểm tra mã OTP có khớp không
    if (user.resetOtp !== otp) {
      throw new BadRequestException('Mã OTP không chính xác!');
    }

    // 3. Nếu đúng hết -> Băm mật khẩu mới và lưu
    const hashedPass = await bcrypt.hash(newPass, 10);
    await this.usersService.updatePassword(user.id, hashedPass);

    // 4. Xóa mã OTP đi để không dùng lại được nữa
    await this.usersService.clearResetOtp(user.id);
    
    // (Tùy chọn) Xóa luôn Refresh Token để user phải đăng nhập lại
    await this.usersService.updateRefreshToken(user.id, null);

    return { message: 'Đổi mật khẩu mới thành công! Vui lòng đăng nhập lại.' };
  }

  async register(createUserDto: CreateUserDto) {
    // 1. Dùng service của Users để tạo user
    const user = await this.usersService.create(createUserDto);

    // 2. Gán role 'Customer' 
    await this.userRolesService.assignRoleByName(user.id, 'Customer');

    // 3. Trả về ID cực gọn
    return { 
        message: 'Đăng ký thành công!',
        id: user.id 
    };
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    // 1. Tìm user hiện tại đang request
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản!');
    }

    // 2. Kiểm tra xem mật khẩu cũ nhập vào có đúng không
    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu cũ không chính xác!');
    }

    // 3. Nếu đúng -> Băm mật khẩu mới
    const hashedNewPass = await bcrypt.hash(newPass, 10);

    // 4. Lưu xuống Database (Tận dụng lại hàm updatePassword lúc nãy)
    await this.usersService.updatePassword(userId, hashedNewPass);

    // 5. (Tùy chọn) Thu hồi Refresh Token hiện tại để bắt các thiết bị khác phải đăng nhập lại
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' };
  }
}