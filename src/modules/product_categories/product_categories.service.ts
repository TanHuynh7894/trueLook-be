import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductCategoryDto } from './dto/create-product_category.dto';
import { UpdateProductCategoryDto } from './dto/update-product_category.dto';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product_category.entity';
import { Product } from '../products/entities/product.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private productCategoriesRepository: Repository<ProductCategory>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createProductCategoryDto: CreateProductCategoryDto) {
    const product = await this.productsRepository.findOneBy({ id: createProductCategoryDto.product_id });
    if (!product) {
      throw new NotFoundException(`Product with id ${createProductCategoryDto.product_id} not found`);
    }

    const category = await this.categoriesRepository.findOneBy({ id: createProductCategoryDto.category_id });
    if (!category) {
      throw new NotFoundException(`Category with id ${createProductCategoryDto.category_id} not found`);
    }

    const existing = await this.productCategoriesRepository.findOneBy({
      product_id: createProductCategoryDto.product_id,
      category_id: createProductCategoryDto.category_id,
    });
    if (existing) {
      throw new ConflictException(
        `Product category (${createProductCategoryDto.product_id}, ${createProductCategoryDto.category_id}) already exists`,
      );
    }

    const newProductCategory = this.productCategoriesRepository.create(createProductCategoryDto);
    return await this.productCategoriesRepository.save(newProductCategory);
  }

  findAll() {
    return this.productCategoriesRepository.find();
  }

  async findOne(productId: string, categoryId: string) {
    const productCategory = await this.productCategoriesRepository.findOneBy({
      product_id: productId,
      category_id: categoryId,
    });
    if (!productCategory) {
      throw new NotFoundException(`Product category (${productId}, ${categoryId}) not found`);
    }
    return productCategory;
  }

  async update(
    productId: string,
    categoryId: string,
    updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    await this.findOne(productId, categoryId);

    const nextProductId = updateProductCategoryDto.product_id ?? productId;
    const nextCategoryId = updateProductCategoryDto.category_id ?? categoryId;

    if (updateProductCategoryDto.product_id) {
      const product = await this.productsRepository.findOneBy({ id: updateProductCategoryDto.product_id });
      if (!product) {
        throw new NotFoundException(`Product with id ${updateProductCategoryDto.product_id} not found`);
      }
    }

    if (updateProductCategoryDto.category_id) {
      const category = await this.categoriesRepository.findOneBy({ id: updateProductCategoryDto.category_id });
      if (!category) {
        throw new NotFoundException(`Category with id ${updateProductCategoryDto.category_id} not found`);
      }
    }

    const duplicate = await this.productCategoriesRepository.findOneBy({
      product_id: nextProductId,
      category_id: nextCategoryId,
    });
    if (duplicate && (nextProductId !== productId || nextCategoryId !== categoryId)) {
      throw new ConflictException(`Product category (${nextProductId}, ${nextCategoryId}) already exists`);
    }

    await this.productCategoriesRepository.update(
      { product_id: productId, category_id: categoryId },
      updateProductCategoryDto,
    );
    return this.findOne(nextProductId, nextCategoryId);
  }

  async remove(productId: string, categoryId: string) {
    const result = await this.productCategoriesRepository.delete({
      product_id: productId,
      category_id: categoryId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Product category (${productId}, ${categoryId}) not found for delete`);
    }
    return {
      message: `Deleted product category (${productId}, ${categoryId})`,
      statusCode: 200,
    };
  }
}
