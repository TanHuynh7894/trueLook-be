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
import { RxLensSpecsService } from './rx-lens-specs.service';
import { CreateRxLensSpecDto } from './dto/create-rx-lens-spec.dto';
import { UpdateRxLensSpecDto } from './dto/update-rx-lens-spec.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RxLensSpecSearchQueryDto } from './dto/rx-lens-spec-search-query.dto';

type AuthRequest = { user?: { roles?: string[] } };

@Controller('rx-lens-specs')
export class RxLensSpecsController {
  constructor(private readonly service: RxLensSpecsService) {}

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({ summary: 'System Admin hoac Manager tao rx lens spec' })
  create(@Body() dto: CreateRxLensSpecDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({
    summary:
      'System Admin xem tat ca, Manager chi xem Rx lens spec dang Active (search type, material)',
  })
  findAll(@Req() req: AuthRequest, @Query() query: RxLensSpecSearchQueryDto) {
    const roles = req.user?.roles ?? [];
    const isSystemAdmin = roles.includes('System Admin');
    return this.service.searchRxLensSpecs(query, isSystemAdmin);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({
    summary:
      'System Admin xem duoc tat ca status, Manager chi xem duoc status Active',
  })
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    const roles = req.user?.roles ?? [];
    const isSystemAdmin = roles.includes('System Admin');
    return this.service.findOneForView(id, isSystemAdmin);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({
    summary:
      'System Admin hoac Manager cap nhat rx lens spec (product_id, type, material, lens_width, min_sphere, max_sphere, min_cylinder, status)',
  })
  update(@Param('id') id: string, @Body() dto: UpdateRxLensSpecDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager', 'Operation Staff', 'Sales Staff')
  @ApiOperation({
    summary: 'System Admin hoac Manager xoa rx lens spec',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
