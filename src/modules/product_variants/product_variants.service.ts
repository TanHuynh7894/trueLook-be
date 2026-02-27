import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductVariantDto } from './dto/create-product_variant.dto';
import { UpdateProductVariantDto } from './dto/update-product_variant.dto';
import { Repository } from 'typeorm';
import { ProductVariant } from './entities/product_variant.entity';
import { Product } from '../products/entities/product.entity';
import { Image } from '../images/entities/image.entity';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
  ) {}

  async create(createProductVariantDto: CreateProductVariantDto) {
    const product = await this.productsRepository.findOneBy({ id: createProductVariantDto.product_id });
    if (!product) {
      throw new NotFoundException(`Product with id ${createProductVariantDto.product_id} not found`);
    }

    const existingCode = await this.productVariantsRepository.findOneBy({ code: createProductVariantDto.code });
    if (existingCode) {
      throw new ConflictException(`Product variant code ${createProductVariantDto.code} already exists`);
    }

    const newProductVariant = this.productVariantsRepository.create(createProductVariantDto);
    return await this.productVariantsRepository.save(newProductVariant);
  }

  findAll() {
    return this.productVariantsRepository.find();
  }

  async findOne(id: string) {
    const productVariant = await this.productVariantsRepository.findOneBy({ id });
    if (!productVariant) {
      throw new NotFoundException(`Product variant with id ${id} not found`);
    }
    return productVariant;
  }

  async update(id: string, updateProductVariantDto: UpdateProductVariantDto) {
    await this.findOne(id);

    if (updateProductVariantDto.product_id) {
      const product = await this.productsRepository.findOneBy({ id: updateProductVariantDto.product_id });
      if (!product) {
        throw new NotFoundException(`Product with id ${updateProductVariantDto.product_id} not found`);
      }
    }

    if (updateProductVariantDto.code) {
      const existingCode = await this.productVariantsRepository.findOneBy({ code: updateProductVariantDto.code });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(`Product variant code ${updateProductVariantDto.code} already exists`);
      }
    }

    await this.productVariantsRepository.update(id, updateProductVariantDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.productVariantsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product variant with id ${id} not found for delete`);
    }
    return {
      message: `Deleted product variant with id: ${id}`,
      statusCode: 200,
    };
  }

  async addImage(variantId: string, path: string) {
    const variant = await this.productVariantsRepository.findOneBy({ id: variantId });
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${variantId} not found`);
    }

    const image = this.imagesRepository.create({
      variant_id: variantId,
      path,
    });

    return this.imagesRepository.save(image);
  }
}
