import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AiSupersetService } from './ai-superset.service';
import { PreviewDataDto } from './dto/preview-data.dto';
import { AnalyzeChartsDto } from './dto/analyze-charts.dto';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('AI Superset')
@ApiBearerAuth('access-token')
@Controller('ai-superset')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AiSupersetController {
  constructor(private readonly aiSupersetService: AiSupersetService) {}

  @Get('models')
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Lấy danh sách các model AI khả dụng' })
  getAvailableModels() {
    return this.aiSupersetService.listModels();
  }

  @Post('preview')
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Xem trước dữ liệu biểu đồ trước khi gửi cho AI' })
  async previewData(@Body() previewDto: PreviewDataDto) { 
    return this.aiSupersetService.getPreviewData(previewDto.chartIds);
  }

  @Post('analyze-charts')
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Phân tích và so sánh các biểu đồ bằng AI' })
  async analyzeCharts(@Body() analyzeDto: AnalyzeChartsDto) {
    return this.aiSupersetService.analyzeCharts(analyzeDto.model, analyzeDto.chartIds);
  }
}