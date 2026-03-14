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
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,

    private configService: ConfigService,

    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
  ) { }

  async getUploadPathByRoles(roles: string[]): Promise<string> {
    let uploadPath = 'src/uploads';

    if (roles.includes('Operation Staff') || roles.includes('Customer')) {
      uploadPath = 'uploads/images';
    }

    return uploadPath;
  }

  async create(createImageDto: CreateImageDto) {
    if (!createImageDto.variant_id || createImageDto.variant_id === '') {
      delete createImageDto.variant_id;
    }

    if (createImageDto.variant_id) {
      const variant = await this.productVariantsRepository.findOneBy({
        id: createImageDto.variant_id,
      });

      if (!variant) {
        throw new NotFoundException(
          `Product variant with id ${createImageDto.variant_id} not found`,
        );
      }
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

  // FIX 1: đảm bảo folder uploads tồn tại trước khi write file
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
  variant_id: string | null;
  path: string;
};

export const IMAGE_DATA_SNAPSHOT: ImageDataSnapshot[] = ${JSON.stringify(
      snapshot,
      null,
      2,
    )};
`;

    const folder = join(process.cwd(), 'uploads');

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const snapshotPath = join(folder, 'images.data.ts');

    try {
      await writeFile(snapshotPath, content, 'utf8');
    } catch (error) {
      throw new InternalServerErrorException(
        'Khong the dong bo file snapshot images',
      );
    }
  }

  // FIX 2: không tự tạo file path mới, dùng file.path của multer
  async uploadImage(file: Express.Multer.File, dto: CreateImageDto, roles: string[]) {

    const uploadPath = await this.getUploadPathByRoles(roles);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const newPath = `${uploadPath}/${file.filename}`;

    fs.renameSync(file.path, newPath);

    dto.path = newPath;

    return this.create(dto);
  }
  async getImagePathById(id: string): Promise<string | null> {
    const image = await this.imagesRepository.findOne({
      where: { id },
    });

    if (!image) {
      return null;
    }

    const filepath = image.path;

    const root = process.cwd();

    const path1 = join(root, filepath);          // uploads/images/...
    const path2 = join(root, 'src', filepath);   // src/uploads/...

    if (fs.existsSync(path1)) {
      return path1;
    }

    if (fs.existsSync(path2)) {
      return path2;
    }

    return null;
  }

  async deleteImage(id: string) {
    const image = await this.imagesRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }

    const filepath = join(process.cwd(), 'src/uploads', image.path);

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await this.imagesRepository.delete(id);

    return {
      message: 'Image deleted successfully',
    };
  }

  async getAllImages() {
    const baseUrl = this.configService.get<string>('BASE_URL');

    const images = await this.imagesRepository.find();

    return images.map((img) => ({
      id: img.id,
      variant_id: img.variant_id,
      image_url: `${baseUrl}/images/${img.id}`,
    }));
  }
}