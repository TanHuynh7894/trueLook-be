
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UserRolesService } from '../user_roles/user_roles.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetUser } from '../../common/decorators/get-user.decorator';
import axios from 'axios';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Post('staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Tạo tài khoản nhân viên (Chỉ Admin/Manager)' })
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    const { roleName, password, ...userData } = createStaffDto;

    const user = await this.usersService.create({
      ...userData,
      password,
    } as any);

    await this.userRolesService.assignRoleByName(user.id, roleName);

    try {
      // ===== 1. LẤY ADMIN TOKEN =====
      const tokenParams = new URLSearchParams();
      tokenParams.append('grant_type', 'client_credentials');
      tokenParams.append('client_id', process.env.KEYCLOAK_CLIENT_ID!);
      tokenParams.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET!);

      const tokenResponse = await axios.post(
        process.env.KEYCLOAK_TOKEN_URL!,
        tokenParams,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const adminToken = tokenResponse.data.access_token;

      console.log('[Keycloak] Admin token OK');

      // ===== 2. TẠO USER TRONG KEYCLOAK =====
      const keycloakUserData = {
        username: userData.username,
        email: userData.email,
        firstName: userData.fullName,
        enabled: true,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      };

      const createUserResp = await axios.post(
        process.env.KEYCLOAK_ADMIN_USERS_URL!,
        keycloakUserData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('[Keycloak] User created');

      // ===== 3. LẤY USER ID TỪ HEADER LOCATION =====
      const location = createUserResp.headers.location;
      const keycloakUserId = location.split('/').pop();

      // ===== 4. LẤY ROLE =====
      const realmAdminUrl =
        process.env.KEYCLOAK_ADMIN_USERS_URL!.replace('/users', '');

      const roleResp = await axios.get(
        `${realmAdminUrl}/roles/${encodeURIComponent(roleName)}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        },
      );

      const role = roleResp.data;

      // ===== 5. GÁN ROLE CHO USER =====
      await axios.post(
        `${process.env.KEYCLOAK_ADMIN_USERS_URL}/${keycloakUserId}/role-mappings/realm`,
        [
          {
            id: role.id,
            name: role.name,
          },
        ],
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`[Keycloak] Role ${roleName} assigned`);
    } catch (error: any) {
      console.error('===== KEYCLOAK ERROR =====');

      if (error.response) {
        console.error('STATUS:', error.response.status);
        console.error('DATA:', error.response.data);
      } else {
        console.error(error.message);
      }

      console.error('==========================');
    }

    return {
      message: 'Đã tạo tài khoản nhân viên thành công!',
      user: {
        id: user.id,
        username: user.username,
        role: roleName,
      },
    };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Xem thông tin cá nhân (Profile)' })
  getProfile(@GetUser() user: any) {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân (Profile)' })
  updateProfile(@GetUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(user.sub, updateUserDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Lấy danh sách tất cả Users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Lấy thông tin User theo ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Cập nhật thông tin User theo ID' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Khóa tài khoản' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
