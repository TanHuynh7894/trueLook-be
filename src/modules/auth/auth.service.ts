import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { UserRolesService } from '../user_roles/user_roles.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { randomBytes } from 'crypto';

interface GoogleProfilePayload {
  email?: string;
  fullName?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private userRolesService: UserRolesService,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.usersService.findOneByUsername(username);
    if (!user || !user.password) {
      throw new UnauthorizedException('Tai khoan khong ton tai!');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Mat khau khong chinh xac!');
    }

    return this.buildAuthResponse(user);
  }

  async signInWithGoogle(googleUser: GoogleProfilePayload) {
    const email = googleUser?.email?.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Khong lay duoc email tu tai khoan Google');
    }

    let user = await this.usersService.findOneByEmailWithRoles(email);

    if (!user) {
      const usernameSeed = email.split('@')[0] || 'googleuser';
      const username = await this.generateUniqueUsername(usernameSeed);

      const createUserDto: CreateUserDto = {
        username,
        password: randomBytes(32).toString('hex'),
        fullName: googleUser.fullName || username,
        email,
        gender: 'O',
        birthday: '2000-01-01',
      };

      const createdUser = await this.usersService.create(createUserDto);
      await this.userRolesService.assignRoleByName(createdUser.id, 'Customer');
      user = await this.usersService.findOneByUsername(username);
    }

    if (!user) {
      throw new UnauthorizedException('Dang nhap Google that bai');
    }

    return this.buildAuthResponse(user);
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.usersService.findOneWithRoles(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Truy cap bi tu choi!');
    }

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) {
      throw new UnauthorizedException('Refresh Token khong hop le hoac da bi thu hoi!');
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      roles,
    };

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

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Dang xuat thanh cong, da thu hoi Token!' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Email khong ton tai trong he thong!');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.usersService.saveResetOtp(user.id, otp, expiresAt);

    console.log(`[TEST] Ma OTP cua user ${email} la: ${otp}`);
    await this.mailerService.sendMail({
      to: email,
      subject: 'Ma OTP dat lai mat khau - True Look',
      html: `<b>Ma OTP cua ban la: ${otp}</b>`,
    });
    return { message: 'Ma xac nhan 6 so da duoc gui den email cua ban!' };
  }

  async resetPassword(email: string, otp: string, newPass: string) {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      throw new BadRequestException('Yeu cau khong hop le!');
    }

    if (new Date() > user.resetOtpExpires) {
      throw new BadRequestException('Ma OTP da het han, vui long yeu cau ma moi!');
    }

    if (user.resetOtp !== otp) {
      throw new BadRequestException('Ma OTP khong chinh xac!');
    }

    const hashedPass = await bcrypt.hash(newPass, 10);
    await this.usersService.updatePassword(user.id, hashedPass);

    await this.usersService.clearResetOtp(user.id);
    await this.usersService.updateRefreshToken(user.id, null);

    return { message: 'Doi mat khau moi thanh cong! Vui long dang nhap lai.' };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    await this.userRolesService.assignRoleByName(user.id, 'Customer');

    return {
      message: 'Dang ky thanh cong!',
      id: user.id,
    };
  }

  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('Khong tim thay tai khoan!');
    }

    const isMatch = await bcrypt.compare(oldPass, user.password);
    if (!isMatch) {
      throw new BadRequestException('Mat khau cu khong chinh xac!');
    }

    const hashedNewPass = await bcrypt.hash(newPass, 10);
    await this.usersService.updatePassword(userId, hashedNewPass);
    await this.usersService.updateRefreshToken(userId, null);

    return { message: 'Doi mat khau thanh cong! Vui long dang nhap lai.' };
  }

  private async buildAuthResponse(user: any) {
    const roles = user.userRoles?.map((ur: any) => ur.role.name) || [];

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      roles,
    };

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

    await this.usersService.updateRefreshToken(user.id, refreshToken);

    const {
      password,
      refreshToken: currentRefreshToken,
      resetOtp,
      resetOtpExpires,
      userRoles,
      ...fullUserInfo
    } = user;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        ...fullUserInfo,
        roles,
      },
    };
  }

  private async generateUniqueUsername(seed: string) {
    const sanitized = seed.replace(/[^a-zA-Z0-9._-]/g, '') || 'googleuser';
    let candidate = sanitized;
    let index = 1;

    while (await this.usersService.findOneByUsername(candidate)) {
      candidate = `${sanitized}${index}`;
      index += 1;
    }

    return candidate;
  }
}
