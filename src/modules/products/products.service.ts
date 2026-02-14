import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Brand } from '../brands/entities/brand.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const brand = await this.brandsRepository.findOneBy({ id: createProductDto.brand_id });
    if (!brand) {
      throw new NotFoundException(`Brand with id ${createProductDto.brand_id} not found`);
    }

    const existingCode = await this.productsRepository.findOneBy({ code: createProductDto.code });
    if (existingCode) {
      throw new ConflictException(`Product code ${createProductDto.code} already exists`);
    }

    const newProduct = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(newProduct);
  }

  findAll() {
    return this.productsRepository.find();
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    if (updateProductDto.brand_id) {
      const brand = await this.brandsRepository.findOneBy({ id: updateProductDto.brand_id });
      if (!brand) {
        throw new NotFoundException(`Brand with id ${updateProductDto.brand_id} not found`);
      }
    }

    if (updateProductDto.code) {
      const existingCode = await this.productsRepository.findOneBy({ code: updateProductDto.code });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(`Product code ${updateProductDto.code} already exists`);
      }
    }

    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with id ${id} not found for delete`);
    }
    return {
      message: `Deleted product with id: ${id}`,
      statusCode: 200,
    };
  }
}
