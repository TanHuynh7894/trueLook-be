import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserRolesService } from './user_roles.service';
import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { UpdateUserRoleDto } from './dto/update-user_role.dto';

@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Post()
  create(@Body() createUserRoleDto: CreateUserRoleDto) {
    return this.userRolesService.create(createUserRoleDto);
  }

  @Get()
  findAll() {
    return this.userRolesService.findAll();
  }

  @Get(':userId/:roleId')
  findOne(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRolesService.findOne(userId, roleId);
  }

  @Patch(':userId/:roleId')
  update(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userRolesService.update(userId, roleId, updateUserRoleDto);
  }

  @Delete(':userId/:roleId')
  remove(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRolesService.remove(userId, roleId);
  }
}
