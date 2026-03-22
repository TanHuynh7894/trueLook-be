import { Controller, Get, Param, ParseIntPipe, UseGuards, Post, Logger, HttpStatus } from '@nestjs/common';
import { SupersetService } from './superset.service';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Superset')
@ApiBearerAuth('access-token')
@Controller('superset')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class SupersetController {
  private readonly logger = new Logger(SupersetController.name);

  constructor(private readonly supersetService: SupersetService) {}

  @Get('sso-link')
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Lấy đường dẫn đăng nhập SSO sang Superset' })
  getLink() {
    return this.supersetService.getSsoLink();
  }

  @Get('chart/:id/data')
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Lấy dữ liệu thực tế của một Chart theo ID' })
  @ApiParam({ name: 'id', description: 'ID của Chart trong Superset', example: 1 })
  async getChartData(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Đang truy vấn dữ liệu cho Chart ID: ${id}`);
    return await this.supersetService.getChartData(id);
  }

  // Bonus: Endpoint lấy thông tin thô nếu cần debug
  @Get('chart/:id/metadata')
  @Roles('System Admin')
  @ApiOperation({ summary: 'Lấy Metadata (cấu hình) của Chart' })
  async getChartMetadata(@Param('id', ParseIntPipe) id: number) {
    // Bạn có thể bổ sung hàm lấy metadata riêng trong service nếu muốn
    return await this.supersetService.getChartData(id); 
  }
}