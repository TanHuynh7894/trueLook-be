import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FrameSpec } from './entities/frame-spec.entity';
import { CreateFrameSpecDto } from './dto/create-frame-spec.dto';
import { UpdateFrameSpecDto } from './dto/update-frame-spec.dto';

@Injectable()
export class FrameSpecsService {
  constructor(
    @InjectRepository(FrameSpec)
    private readonly repo: Repository<FrameSpec>,
  ) {}

  create(dto: CreateFrameSpecDto) {
    const spec = this.repo.create(dto);
    return this.repo.save(spec);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const spec = await this.repo.findOneBy({ id });
    if (!spec) throw new NotFoundException(`Frame Spec ${id} không tồn tại`);
    return spec;
  }

  async update(id: string, dto: UpdateFrameSpecDto) {
    const spec = await this.findOne(id);
    const updated = Object.assign(spec, dto);
    return await this.repo.save(updated);
  }

  async remove(id: string) {
    const spec = await this.findOne(id);
    return await this.repo.remove(spec);
  }
}