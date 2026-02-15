import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
  ) {}

  async create(createImageDto: CreateImageDto) {
    const variant = await this.productVariantsRepository.findOneBy({ id: createImageDto.variant_id });
    if (!variant) {
      throw new NotFoundException(`Product variant with id ${createImageDto.variant_id} not found`);
    }

    const newImage = this.imagesRepository.create(createImageDto);
    return await this.imagesRepository.save(newImage);
  }

  findAll() {
    return this.imagesRepository.find();
  }

  async findOne(id: string) {
    const image = await this.imagesRepository.findOneBy({ id });
    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    return image;
  }

  async update(id: string, updateImageDto: UpdateImageDto) {
    if (updateImageDto.variant_id) {
      const variant = await this.productVariantsRepository.findOneBy({ id: updateImageDto.variant_id });
      if (!variant) {
        throw new NotFoundException(`Product variant with id ${updateImageDto.variant_id} not found`);
      }
    }

    await this.imagesRepository.update(id, updateImageDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.imagesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Image with id ${id} not found for delete`);
    }
    return {
      message: `Deleted image with id: ${id}`,
      statusCode: 200,
    };
  }
}
