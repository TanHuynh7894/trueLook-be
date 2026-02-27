import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { ApiBearerAuth, ApiConflictResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post('create')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Admin tao brand' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get('findAll')
  findAll() {
    return this.brandsService.findAll();
  }

  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch('update/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Admin hoac Manager cap nhat brand' })
  @ApiConflictResponse({ description: 'Da co brand do roi' })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete('remove/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('System Admin', 'Manager')
  @ApiOperation({ summary: 'Admin hoac Manager xoa brand' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }
}

@ApiTags('Brands')
@Controller('api/v1/brands')
export class BrandsPublicController {
  constructor(private readonly brandsService: BrandsService) {}

  // GET /api/v1/brands - Lay danh muc/thuong hieu dang co status active
  @Get()
  @ApiOperation({ summary: 'Lay thuong hieu dang active' })
  findActive() {
    return this.brandsService.findActive();
  }
}
