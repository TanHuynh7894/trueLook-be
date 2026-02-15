import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductPromotionsService } from './product_promotions.service';
import { CreateProductPromotionDto } from './dto/create-product_promotion.dto';
import { UpdateProductPromotionDto } from './dto/update-product_promotion.dto';

@Controller('product-promotions')
export class ProductPromotionsController {
  constructor(private readonly productPromotionsService: ProductPromotionsService) {}

  @Post()
  create(@Body() createProductPromotionDto: CreateProductPromotionDto) {
    return this.productPromotionsService.create(createProductPromotionDto);
  }

  @Get()
  findAll() {
    return this.productPromotionsService.findAll();
  }

  @Get(':variantId/:promotionId')
  findOne(@Param('variantId') variantId: string, @Param('promotionId') promotionId: string) {
    return this.productPromotionsService.findOne(variantId, promotionId);
  }

  @Patch(':variantId/:promotionId')
  update(
    @Param('variantId') variantId: string,
    @Param('promotionId') promotionId: string,
    @Body() updateProductPromotionDto: UpdateProductPromotionDto,
  ) {
    return this.productPromotionsService.update(variantId, promotionId, updateProductPromotionDto);
  }

  @Delete(':variantId/:promotionId')
  remove(@Param('variantId') variantId: string, @Param('promotionId') promotionId: string) {
    return this.productPromotionsService.remove(variantId, promotionId);
  }
}
