import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { PublicProductsQueryDto } from './dto/public-products-query.dto';

@ApiTags('Public Catalog')
@Controller('api/v1/products')
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Tim kiem va loc san pham public theo brand_id, category_id, product_type, search',
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'brand_id', required: false, type: String })
  @ApiQuery({ name: 'category_id', required: false, type: String })
  @ApiQuery({ name: 'product_type', required: false, type: String })
  findPublicProducts(@Query() query: PublicProductsQueryDto) {
    return this.productsService.findPublicProducts(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lay chi tiet 1 san pham public (brand, categories, variants, images, specs)',
  })
  findPublicProductDetail(@Param('id') id: string) {
    return this.productsService.findPublicProductDetail(id);
  }
}
