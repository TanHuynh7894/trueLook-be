
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
import { KeycloakService } from './keycloak.service';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
    private readonly keycloakService: KeycloakService,
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

    // 2. Gán Role dưới Local Database
    await this.userRolesService.assignRoleByName(user.id, roleName);

    // 3. CHỐT CHẶN: Chỉ ném sang Keycloak nếu là System Admin hoặc Manager
    const allowedKeycloakRoles = ['System Admin', 'Manager'];
    
    if (allowedKeycloakRoles.includes(roleName)) {
      console.log(`=> Chức vụ ${roleName} VIP, đang đồng bộ sang Keycloak...`);
      // Gọi service Keycloak vừa viết ở bước 1
      await this.keycloakService.createUserAndAssignRole(userData, password, roleName);
    } else {
      console.log(`=> Chức vụ ${roleName} không cần đồng bộ Keycloak, bỏ qua.`);
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
