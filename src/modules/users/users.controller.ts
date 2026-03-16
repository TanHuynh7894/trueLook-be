
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
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
      private readonly logger = new Logger(UsersController.name);
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
    const allowedKeycloakRoles = ['System Admin', 'Manager'];

    try {
      if (allowedKeycloakRoles.includes(roleName)) {
        this.logger.log(`=> Chức vụ ${roleName} VIP, đang đồng bộ sang Keycloak...`);
        await this.keycloakService.createUserAndAssignRole(userData, password, roleName);
        this.logger.log(`=> Keycloak OK! Tiếp tục tạo Local DB.`);
      } else {
        this.logger.log(`=> Chức vụ ${roleName} không cần Keycloak, bỏ qua bước 1.`);
      }

      const user = await this.usersService.create({
        ...userData,
        password,
      } as any);

      if (!user || !user.id) {
        throw new Error('Hệ thống Local DB tạo user thành công nhưng không trả về ID!');
      }

      await this.userRolesService.assignRoleByName(user.id, roleName);

      return {
        message: 'Đã tạo tài khoản nhân viên thành công!',
        user: {
          id: user.id,
          username: user.username,
          role: roleName,
        },
      };

    } catch (error: any) {

      this.logger.error(`LỖI TẠO STAFF: ${error.message}`, error.stack);

      if (error instanceof HttpException) {
        throw error; 
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Lỗi hệ thống khi tạo nhân viên: ' + error.message,
          error: 'Internal Server Error'
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
