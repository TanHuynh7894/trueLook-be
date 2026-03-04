import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RxLensSpec } from './entities/rx-lens-spec.entity';
import { CreateRxLensSpecDto } from './dto/create-rx-lens-spec.dto';
import { UpdateRxLensSpecDto } from './dto/update-rx-lens-spec.dto';

@Injectable()
export class RxLensSpecsService {
  constructor(
    @InjectRepository(RxLensSpec)
    private readonly repo: Repository<RxLensSpec>,
  ) {}

  create(dto: CreateRxLensSpecDto) {
    const spec = this.repo.create(dto);
    return this.repo.save(spec);
  }

  findAll() {
    return this.repo.find();
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
    const spec = await this.findOne(id);
    return await this.repo.remove(spec);
  }
}
