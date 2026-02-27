import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductVariantsService } from './product_variants.service';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminCreateVariantDto } from '../products/dto/admin-create-variant.dto';
import { AdminUpdateVariantDto } from '../products/dto/admin-update-variant.dto';

@ApiTags('ProductVariants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  create(@Body() createProductVariantDto: CreateProductVariantDto) {
    return this.productVariantsService.create(createProductVariantDto);
  }

  @Get()
  findAll() {
    return this.productVariantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductVariantDto: UpdateProductVariantDto) {
    return this.productVariantsService.update(id, updateProductVariantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }
}

@ApiTags('ProductVariants')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('System Admin', 'Admin', 'Manager')
@Controller('api/v1/admin')
export class ProductVariantsAdminController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post('products/:id/variants')
  @ApiOperation({ summary: 'Tao SKU moi (ghi vao product_variants)' })
  createVariant(@Param('id') id: string, @Body() dto: AdminCreateVariantDto) {
    return this.productVariantsService.create({
      ...dto,
      product_id: id,
      status: dto.status ?? 'active',
    } as CreateProductVariantDto);
  }

  @Patch('variants/:id')
  @ApiOperation({ summary: 'Cap nhat gia va ton kho variant' })
  updateVariant(@Param('id') id: string, @Body() dto: AdminUpdateVariantDto) {
    return this.productVariantsService.update(id, dto);
  }
}
