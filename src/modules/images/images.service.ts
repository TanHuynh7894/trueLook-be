import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
  ) {}

  async create(createImageDto: CreateImageDto) {
    const variant = await this.productVariantsRepository.findOneBy({
      id: createImageDto.variant_id,
    });
    if (!variant) {
      throw new NotFoundException(
        `Product variant with id ${createImageDto.variant_id} not found`,
      );
    }

    const newImage = this.imagesRepository.create(createImageDto);
    const saved = await this.imagesRepository.save(newImage);
    await this.syncImagesSnapshot();
    return saved;
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
    await this.findOne(id);

    if (updateImageDto.variant_id) {
      const variant = await this.productVariantsRepository.findOneBy({
        id: updateImageDto.variant_id,
      });
      if (!variant) {
        throw new NotFoundException(
          `Product variant with id ${updateImageDto.variant_id} not found`,
        );
      }
    }

    await this.imagesRepository.update(id, updateImageDto);
    const updated = await this.findOne(id);
    await this.syncImagesSnapshot();
    return updated;
  }

  async remove(id: string) {
    const result = await this.imagesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Image with id ${id} not found for delete`);
    }
    await this.syncImagesSnapshot();
    return {
      message: `Deleted image with id: ${id}`,
      statusCode: 200,
    };
  }

  private async syncImagesSnapshot() {
    const images = await this.imagesRepository.find({ order: { id: 'ASC' } });
    const snapshot = images.map((image) => ({
      id: image.id,
      variant_id: image.variant_id,
      path: image.path,
    }));

    const content = `// Auto-generated from DB by ImagesService. Do not edit manually.
export type ImageDataSnapshot = {
  id: string;
  variant_id: string;
  path: string;
};

export const IMAGE_DATA_SNAPSHOT: ImageDataSnapshot[] = ${JSON.stringify(snapshot, null, 2)};
`;

    const snapshotPath = join(
      process.cwd(),
      'src',
      'modules',
      'images',
      'images.data.ts',
    );
    try {
      await writeFile(snapshotPath, content, 'utf8');
    } catch (error) {
      throw new InternalServerErrorException(
        'Khong the dong bo file snapshot images',
      );
    }
  }
}
