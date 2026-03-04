import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FrameSpecsService } from './frame-specs.service';
import { CreateFrameSpecDto } from './dto/create-frame-spec.dto';
import { UpdateFrameSpecDto } from './dto/update-frame-spec.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { FrameSpecSearchQueryDto } from './dto/frame-spec-search-query.dto';

type AuthRequest = { user?: { roles?: string[] } };

@Controller('frame-spec')
export class FrameSpecsController {
  constructor(private readonly service: FrameSpecsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'System Admin hoac Manager tao frame spec' })
  create(@Body() dto: CreateFrameSpecDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({
    summary: 'Xem danh sach frame spec',
  })
  findAll(@Req() req: AuthRequest, @Query() query: FrameSpecSearchQueryDto) {
    const roles = req.user?.roles ?? [];
    const isSystemAdmin = roles.includes('System Admin');
    return this.service.searchFrameSpecs(query, isSystemAdmin);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({
    summary: 'Xem chi tiet frame spec',
  })
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const roles = req.user?.roles ?? [];
    const isSystemAdmin = roles.includes('System Admin');
    return this.service.findOneForView(id, isSystemAdmin);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Cap nhat frame spec' })
  update(@Param('id') id: string, @Body() dto: UpdateFrameSpecDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Chuyen frame spec sang Inactive' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
