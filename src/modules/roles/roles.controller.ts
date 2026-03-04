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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('System Admin', 'Manager')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Tạo quyền mới',
    description:
      'Chỉ System Admin và Manager mới có thể tạo thêm các quyền mới vào hệ thống.',
  })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return {
      message: `Đã tạo thành công quyền mới: ${role.name}`,
      data: role,
    };
  }

  @Get('findAll')
  @ApiOperation({
    summary: 'Lấy danh sách tất cả quyền',
    description:
      'Hiển thị toàn bộ các chức vụ/quyền hạn đang có trong cơ sở dữ liệu.',
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('findOne/:id')
  @ApiOperation({
    summary: 'Xem chi tiết một quyền theo ID',
    description:
      'Tra cứu thông tin chi tiết của một quyền cụ thể thông qua mã ID.',
  })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch('update/:id')
  @ApiOperation({
    summary: 'Cập nhật thông tin quyền',
    description: 'Chỉnh sửa tên hoặc mô tả của một quyền đã tồn tại.',
  })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete('remove/:id')
  @ApiOperation({
    summary: 'Xóa quyền khỏi hệ thống',
    description:
      'Gỡ bỏ hoàn toàn một quyền khỏi cơ sở dữ liệu. Lưu ý: Cần kiểm tra kỹ các ràng buộc nhân sự trước khi xóa.',
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
