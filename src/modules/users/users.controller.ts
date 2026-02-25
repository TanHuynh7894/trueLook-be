import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStaffDto } from './dto/create-staff.dto'; 
import { UserRolesService } from '../user_roles/user_roles.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Post('staff')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin')
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    const { roleName, ...userData } = createStaffDto;
    const user = await this.usersService.create(userData as any);
    await this.userRolesService.assignRoleByName(user.id, roleName);

    return {
      message: `Đã tạo tài khoản nội bộ thành công!`,
      user: {
        id: user.id,
        username: user.username,
        role: roleName
      }
    };
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}