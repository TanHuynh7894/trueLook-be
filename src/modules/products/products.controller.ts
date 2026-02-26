import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PublicProductsQueryDto } from './dto/public-products-query.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUpdateProductDto } from './dto/admin-update-product.dto';
import { AdminAttachCategoryDto } from './dto/admin-attach-category.dto';
import { AdminCreateVariantDto } from './dto/admin-create-variant.dto';
import { AdminUpdateVariantDto } from './dto/admin-update-variant.dto';
import { AdminCreateImageDto } from './dto/admin-create-image.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}

@ApiTags('Products')
@Controller('api/v1/products')
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Tim kiem, loc san pham theo brand_id, category_id, product_type' })
  findPublicProducts(@Query() query: PublicProductsQueryDto) {
    return this.productsService.findPublicProducts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiet 1 san pham (variants, images, specs)' })
  findPublicProductDetail(@Param('id') id: string) {
    return this.productsService.findPublicProductDetail(id);
  }
}

@ApiTags('Products')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('System Admin', 'Admin', 'Manager')
@Controller('api/v1/admin')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('products')
  @ApiOperation({ summary: 'Tao moi thong tin goc san pham (products)' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Sua ten, code, mo ta goc cua san pham' })
  updateProductCoreInfo(@Param('id') id: string, @Body() dto: AdminUpdateProductDto) {
    return this.productsService.updateCoreInfo(id, dto);
  }

  @Post('products/:id/categories')
  @ApiOperation({ summary: 'Gan san pham vao danh muc (product_categories)' })
  attachCategory(@Param('id') id: string, @Body() dto: AdminAttachCategoryDto) {
    return this.productsService.attachCategory(id, dto.category_id);
  }

  @Post('products/:id/variants')
  @ApiOperation({ summary: 'Tao SKU moi (product_variants)' })
  createVariant(@Param('id') id: string, @Body() dto: AdminCreateVariantDto) {
    return this.productsService.createVariant(id, dto);
  }

  @Patch('variants/:id')
  @ApiOperation({ summary: 'Cap nhat gia va ton kho variant' })
  updateVariant(@Param('id') id: string, @Body() dto: AdminUpdateVariantDto) {
    return this.productsService.updateVariantPriceAndStock(id, dto);
  }

  @Post('variants/:id/images')
  @ApiOperation({ summary: 'Upload anh variant (luu URL vao images.path)' })
  createVariantImage(@Param('id') id: string, @Body() dto: AdminCreateImageDto) {
    return this.productsService.addVariantImage(id, dto.path);
  }

  @Delete('images/:id')
  @ApiOperation({ summary: 'Xoa anh theo id' })
  removeImage(@Param('id') id: string) {
    return this.productsService.removeImage(id);
  }
}
