import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from './entities/fearture.entity';
import { CreateFeatureDto } from './dto/create-fearture.dto';
import { UpdateFeatureDto } from './dto/update-fearture.dto';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature)
    private readonly repo: Repository<Feature>,
  ) {}

  create(dto: CreateFeatureDto) {
    const feature = this.repo.create({
      id: `FEA${Date.now().toString().slice(-12)}`,
      ...dto,
    });
    return this.repo.save(feature);
  }

  findAll() {
    return this.repo.find({ relations: ['rxLens'] });
  }

  async findOne(id: string) {
    const feature = await this.repo.findOne({
      where: { id },
      relations: ['rxLens'],
    });
    if (!feature) throw new NotFoundException(`Feature ${id} không tồn tại`);
    return feature;
  }

  async update(id: string, dto: UpdateFeatureDto) {
    const feature = await this.findOne(id);
    const updated = Object.assign(feature, dto);
    return await this.repo.save(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.update(id, { status: 'Inactive' });
    return {
      message: `Da chuyen feature ${id} sang Inactive`,
      statusCode: 200,
    };
  }
}
