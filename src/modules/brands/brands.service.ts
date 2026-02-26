import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private brandsRepository: Repository<Brand>,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const existedBrand = await this.brandsRepository
      .createQueryBuilder('brand')
      .where('LOWER(brand.name) = LOWER(:name)', { name: createBrandDto.name.trim() })
      .getOne();

    if (existedBrand) {
      throw new ConflictException('Da co thuong hieu nay roi');
    }

    const newBrand = this.brandsRepository.create(createBrandDto);
    return await this.brandsRepository.save(newBrand);
  }

  findAll() {
    return this.brandsRepository.find();
  }

  findActive() {
    return this.brandsRepository
      .createQueryBuilder('brand')
      .where('LOWER(brand.status) = :status', { status: 'active' })
      .getMany();
  }

  async findOne(id: string) {
    const brand = await this.brandsRepository.findOneBy({ id });
    if (!brand) {
      throw new NotFoundException(`Không tìm thấy brand có id: ${id}`);
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    await this.brandsRepository.update(id, updateBrandDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.brandsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Không tìm thấy brand có id: ${id} để xóa`);
    }
    return {
      message: `Đã xóa thành công brand có id: ${id}`,
      statusCode: 200,
    };
  }
}
