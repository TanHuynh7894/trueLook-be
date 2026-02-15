import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductPromotionDto } from './dto/create-product_promotion.dto';
import { UpdateProductPromotionDto } from './dto/update-product_promotion.dto';
import { Repository } from 'typeorm';
import { ProductPromotion } from './entities/product_promotion.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { Promotion } from '../promotions/entities/promotion.entity';

@Injectable()
export class ProductPromotionsService {
  constructor(
    @InjectRepository(ProductPromotion)
    private productPromotionsRepository: Repository<ProductPromotion>,
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  async create(createProductPromotionDto: CreateProductPromotionDto) {
    const variant = await this.productVariantsRepository.findOneBy({ id: createProductPromotionDto.variant_id });
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${createProductPromotionDto.variant_id} not found`);
    }

    const promotion = await this.promotionsRepository.findOneBy({ id: createProductPromotionDto.promotion_id });
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${createProductPromotionDto.promotion_id} not found`);
    }

    const existing = await this.productPromotionsRepository.findOneBy({
      variant_id: createProductPromotionDto.variant_id,
      promotion_id: createProductPromotionDto.promotion_id,
    });
    if (existing) {
      throw new ConflictException(
        `Product promotion (${createProductPromotionDto.variant_id}, ${createProductPromotionDto.promotion_id}) already exists`,
      );
    }

    const newProductPromotion = this.productPromotionsRepository.create(createProductPromotionDto);
    return await this.productPromotionsRepository.save(newProductPromotion);
  }

  findAll() {
    return this.productPromotionsRepository.find();
  }

  async findOne(variantId: string, promotionId: string) {
    const productPromotion = await this.productPromotionsRepository.findOneBy({
      variant_id: variantId,
      promotion_id: promotionId,
    });
    if (!productPromotion) {
      throw new NotFoundException(`Product promotion (${variantId}, ${promotionId}) not found`);
    }
    return productPromotion;
  }

  async update(
    variantId: string,
    promotionId: string,
    updateProductPromotionDto: UpdateProductPromotionDto,
  ) {
    await this.findOne(variantId, promotionId);

    const nextVariantId = updateProductPromotionDto.variant_id ?? variantId;
    const nextPromotionId = updateProductPromotionDto.promotion_id ?? promotionId;

    if (updateProductPromotionDto.variant_id) {
      const variant = await this.productVariantsRepository.findOneBy({ id: updateProductPromotionDto.variant_id });
      if (!variant) {
        throw new NotFoundException(`Product variant with id ${updateProductPromotionDto.variant_id} not found`);
      }
    }

    if (updateProductPromotionDto.promotion_id) {
      const promotion = await this.promotionsRepository.findOneBy({ id: updateProductPromotionDto.promotion_id });
      if (!promotion) {
        throw new NotFoundException(`Promotion with id ${updateProductPromotionDto.promotion_id} not found`);
      }
    }

    const duplicate = await this.productPromotionsRepository.findOneBy({
      variant_id: nextVariantId,
      promotion_id: nextPromotionId,
    });
    if (duplicate && (nextVariantId !== variantId || nextPromotionId !== promotionId)) {
      throw new ConflictException(`Product promotion (${nextVariantId}, ${nextPromotionId}) already exists`);
    }

    await this.productPromotionsRepository.update(
      { variant_id: variantId, promotion_id: promotionId },
      updateProductPromotionDto,
    );
    return this.findOne(nextVariantId, nextPromotionId);
  }

  async remove(variantId: string, promotionId: string) {
    const result = await this.productPromotionsRepository.delete({
      variant_id: variantId,
      promotion_id: promotionId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Product promotion (${variantId}, ${promotionId}) not found for delete`);
    }
    return {
      message: `Deleted product promotion (${variantId}, ${promotionId})`,
      statusCode: 200,
    };
  }
}
