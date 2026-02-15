import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductCategoriesService } from './product_categories.service';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';
import { UpdateProductCategoryDto } from './dto/update-product_category.dto';

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
