import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactLensSpec } from './entities/contact-lens-spec.entity';
import { CreateContactLensSpecDto } from './dto/create-contact-lens-spec.dto';
import { UpdateContactLensSpecDto } from './dto/update-contact-lens-spec.dto';

@Injectable()
export class ContactLensSpecsService {
  constructor(
    @InjectRepository(ContactLensSpec)
    private readonly repo: Repository<ContactLensSpec>,
  ) {}

  create(dto: CreateContactLensSpecDto) {
    const spec = this.repo.create(dto);
    return this.repo.save(spec);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const spec = await this.repo.findOneBy({ id });
    if (!spec)
      throw new NotFoundException(`Contact Lens Spec ${id} không tồn tại`);
    return spec;
  }

  async update(id: string, dto: UpdateContactLensSpecDto) {
    const spec = await this.findOne(id);
    const updated = Object.assign(spec, dto);
    return await this.repo.save(updated);
  }

  async remove(id: string) {
    const spec = await this.findOne(id);
    return await this.repo.remove(spec);
  }
}
