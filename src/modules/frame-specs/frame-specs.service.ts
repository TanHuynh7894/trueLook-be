import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrameSpec } from './entities/frame-spec.entity';
import { CreateFrameSpecDto } from './dto/create-frame-spec.dto';
import { UpdateFrameSpecDto } from './dto/update-frame-spec.dto';
import { FrameSpecSearchQueryDto } from './dto/frame-spec-search-query.dto';

@Injectable()
export class FrameSpecsService {
  constructor(
    @InjectRepository(FrameSpec)
    private readonly repo: Repository<FrameSpec>,
  ) {}

  create(dto: CreateFrameSpecDto) {
    const spec = this.repo.create({
      id: `FS${Date.now()}`,
      ...dto,
    });
    return this.repo.save(spec);
  }

  searchFrameSpecs(query: FrameSpecSearchQueryDto, isSystemAdmin: boolean) {
    const qb = this.repo.createQueryBuilder('frameSpec');

    if (query.type) {
      qb.andWhere('LOWER(frameSpec.type) LIKE :type', {
        type: `%${query.type.toLowerCase()}%`,
      });
    }

    if (query.material) {
      qb.andWhere('LOWER(frameSpec.material) LIKE :material', {
        material: `%${query.material.toLowerCase()}%`,
      });
    }

    if (query.shape) {
      qb.andWhere('LOWER(frameSpec.shape) LIKE :shape', {
        shape: `%${query.shape.toLowerCase()}%`,
      });
    }

    if (!isSystemAdmin) {
      qb.andWhere('LOWER(frameSpec.status) = :status', { status: 'active' });
    }

    return qb.getMany();
  }

  async findOneForView(id: string, isSystemAdmin: boolean) {
    const qb = this.repo
      .createQueryBuilder('frameSpec')
      .where('frameSpec.id = :id', { id });

    if (!isSystemAdmin) {
      qb.andWhere('LOWER(frameSpec.status) = :status', { status: 'active' });
    }

    const spec = await qb.getOne();
    if (!spec) {
      throw new NotFoundException(`Khong tim thay frame spec voi id: ${id}`);
    }
    return spec;
  }

  async findOne(id: string) {
    const spec = await this.repo.findOneBy({ id });
    if (!spec) {
      throw new NotFoundException(`Khong tim thay frame spec voi id: ${id}`);
    }
    return spec;
  }

  async update(id: string, dto: UpdateFrameSpecDto) {
    const spec = await this.findOne(id);
    const updated = Object.assign(spec, dto);
    return this.repo.save(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.update(id, { status: 'Inactive' });
    return {
      message: `Da xoa frame spec ${id} thanh cong`,
      statusCode: 200,
    };
  }
}
