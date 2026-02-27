import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductCategoriesService } from './product_categories.service';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';
import { UpdateProductCategoryDto } from './dto/update-product_category.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminAttachCategoryDto } from '../products/dto/admin-attach-category.dto';

@ApiTags('ProductCategories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly productCategoriesService: ProductCategoriesService) {}

  @Post()
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productCategoriesService.create(createProductCategoryDto);
  }

  @Get()
  findAll() {
    return this.productCategoriesService.findAll();
  }

  @Get(':productId/:categoryId')
  findOne(@Param('productId') productId: string, @Param('categoryId') categoryId: string) {
    return this.productCategoriesService.findOne(productId, categoryId);
  }

  @Patch(':productId/:categoryId')
  update(
    @Param('productId') productId: string,
    @Param('categoryId') categoryId: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    return this.productCategoriesService.update(productId, categoryId, updateProductCategoryDto);
  }

  @Delete(':productId/:categoryId')
  remove(@Param('productId') productId: string, @Param('categoryId') categoryId: string) {
    return this.productCategoriesService.remove(productId, categoryId);
  }
}

@ApiTags('ProductCategories')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('System Admin', 'Admin', 'Manager')
@Controller('api/v1/admin/products')
export class ProductCategoriesAdminController {
  constructor(private readonly productCategoriesService: ProductCategoriesService) {}

  @Post(':id/categories')
  @ApiOperation({ summary: 'Gan san pham vao danh muc (ghi vao product_categories)' })
  attachCategory(@Param('id') id: string, @Body() dto: AdminAttachCategoryDto) {
    return this.productCategoriesService.create({
      product_id: id,
      category_id: dto.category_id,
    });
  }
}
