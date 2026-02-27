import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get('findAll')
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}

@ApiTags('Categories')
@Controller('api/v1/categories')
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Lay danh muc dang active' })
  findActive() {
    return this.categoriesService.findActive();
  }
}

@ApiTags('Categories')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('System Admin', 'Admin', 'Manager')
@Controller('api/v1/admin/categories')
export class CategoriesAdminController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Them danh muc moi' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch()
  @ApiOperation({ summary: 'Sua danh muc theo id (truyen id trong body)' })
  update(@Body() dto: AdminUpdateCategoryDto) {
    const { id, ...payload } = dto;
    return this.categoriesService.update(id, payload);
  }
}
