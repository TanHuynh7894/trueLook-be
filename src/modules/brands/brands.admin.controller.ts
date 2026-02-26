import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { AdminUpdateBrandDto } from './dto/admin-update-brand.dto';

@ApiTags('Admin Catalog')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('System Admin', 'Admin', 'Manager')
@Controller('api/v1/admin/brands')
export class BrandsAdminController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Them thuong hieu moi' })
  create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Sua thuong hieu theo id (truyen id trong body)' })
  update(@Body() dto: AdminUpdateBrandDto) {
    const { id, ...payload } = dto;
    return this.brandsService.update(id, payload);
  }
}
