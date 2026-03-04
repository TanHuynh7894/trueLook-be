import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserRolesService } from './user_roles.service';
import { CreateUserRoleDto } from './dto/create-user_role.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('UserRoles')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('System Admin', 'Manager')
@Controller('user-roles')
export class UserRolesController {
  constructor(private readonly userRolesService: UserRolesService) {}

  @Get('user/:userId')
  @ApiOperation({ summary: 'Lấy TẤT CẢ quyền của 1 nhân viên (Đã gom nhóm)' })
  getRolesOfUser(@Param('userId') userId: string) {
    return this.userRolesService.getRolesOfUser(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả phân quyền' })
  findAll() {
    return this.userRolesService.findAll();
  }

  @Post(':userId/sync')
  @ApiOperation({ summary: 'Đồng bộ quyền (Gắn/Gỡ hàng loạt bằng mảng ID)' })
  @ApiBody({ schema: { example: { roleIds: ['ID_QUYEN_1', 'ID_QUYEN_2'] } } })
  syncRoles(
    @Param('userId') userId: string,
    @Body('roleIds') roleIds: string[],
  ) {
    this.userRolesService.syncRoles(userId, roleIds);
    return {
      statusCode: 200,
      message: `Đã đồng bộ quyền cho user ${userId} thành công!`,
    };
  }

  @Delete(':userId/:roleId')
  @ApiOperation({ summary: 'Xóa một phân quyền lẻ' })
  remove(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.userRolesService.remove(userId, roleId);
  }
}
