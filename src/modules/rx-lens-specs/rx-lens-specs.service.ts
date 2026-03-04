import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RxLensSpec } from './entities/rx-lens-spec.entity';
import { CreateRxLensSpecDto } from './dto/create-rx-lens-spec.dto';
import { UpdateRxLensSpecDto } from './dto/update-rx-lens-spec.dto';
import { RxLensSpecSearchQueryDto } from './dto/rx-lens-spec-search-query.dto';
import { Feature } from '../feartures/entities/fearture.entity';

@Injectable()
export class RxLensSpecsService {
  constructor(
    @InjectRepository(RxLensSpec)
    private readonly repo: Repository<RxLensSpec>,
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
  ) {}

  create(dto: CreateRxLensSpecDto) {
    const spec = this.repo.create({
      id: `RX${Date.now()}`,
      ...dto,
      status: dto.status ?? 'Active',
    });
    return this.repo.save(spec);
  }

  findAll() {
    return this.repo.find();
  }

  async searchRxLensSpecs(
    query: RxLensSpecSearchQueryDto,
    isSystemAdmin: boolean,
  ) {
    const qb = this.repo.createQueryBuilder('rxLensSpec');

    if (query.type) {
      qb.andWhere('LOWER(rxLensSpec.type) LIKE :type', {
        type: `%${query.type.toLowerCase()}%`,
      });
    }

    if (query.material) {
      qb.andWhere('LOWER(rxLensSpec.material) LIKE :material', {
        material: `%${query.material.toLowerCase()}%`,
      });
    }

    if (!isSystemAdmin) {
      qb.andWhere('LOWER(rxLensSpec.status) = :status', { status: 'active' });
    }

    const specs = await qb.getMany();
    if (!specs.length) return [];

    const specIds = specs.map((spec) => spec.id);
    const features = await this.featureRepo.find({
      where: specIds.map((id) => ({ rx_lens_id: id })),
    });
    const featuresBySpec = features.reduce<Record<string, Feature[]>>(
      (acc, item) => {
        if (!acc[item.rx_lens_id]) acc[item.rx_lens_id] = [];
        acc[item.rx_lens_id].push(item);
        return acc;
      },
      {},
    );

    return specs.map((spec) => ({
      ...spec,
      features: featuresBySpec[spec.id] || [],
    }));
  }

  async findOneForView(id: string, isSystemAdmin: boolean) {
    const qb = this.repo
      .createQueryBuilder('rxLensSpec')
      .where('rxLensSpec.id = :id', { id });

    if (!isSystemAdmin) {
      qb.andWhere('LOWER(rxLensSpec.status) = :status', { status: 'active' });
    }

    const spec = await qb.getOne();
    if (!spec) {
      throw new NotFoundException(`Khong tim thay rx lens spec voi id: ${id}`);
    }
    const features = await this.featureRepo.find({
      where: { rx_lens_id: spec.id },
    });
    return {
      ...spec,
      features,
    };
  }

  async findOne(id: string) {
    const spec = await this.repo.findOneBy({ id });
    if (!spec) throw new NotFoundException(`Rx Lens Spec ${id} không tồn tại`);
    return spec;
  }

  async update(id: string, dto: UpdateRxLensSpecDto) {
    const spec = await this.findOne(id);
    const updated = Object.assign(spec, dto);
    return await this.repo.save(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.update(id, { status: 'Inactive' });
    return {
      message: `Da xoa rx lens spec ${id} thanh cong`,
      statusCode: 200,
    };
  }
}
