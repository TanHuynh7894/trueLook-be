import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactLensAxis } from './entities/contact_lens_axi.entity';
import { CreateContactLensAxisDto } from './dto/create-contact_lens_axis.dto';
import { UpdateContactLensAxisDto } from './dto/update-contact_lens_axis.dto';
import { ContactLensSpec } from '../contact-lens-specs/entities/contact-lens-spec.entity';

@Injectable()
export class ContactLensAxisService {
  constructor(
    @InjectRepository(ContactLensAxis)
    private readonly repo: Repository<ContactLensAxis>,
    @InjectRepository(ContactLensSpec)
    private readonly contactLensSpecRepo: Repository<ContactLensSpec>,
  ) {}

  async create(dto: CreateContactLensAxisDto) {
    const contactLensSpec = await this.contactLensSpecRepo.findOneBy({
      id: dto.contact_lens_spec_id,
    });
    if (!contactLensSpec) {
      throw new NotFoundException(
        `Khong tim thay contact lens spec voi id: ${dto.contact_lens_spec_id}`,
      );
    }
    const axisValue = dto.axis_value ?? contactLensSpec.axis_min;
    if (axisValue === null || axisValue === undefined) {
      throw new BadRequestException(
        `contact lens spec ${dto.contact_lens_spec_id} chua co axis_value hoac axis_min`,
      );
    }

    const axis = this.repo.create({
      contact_lens_spec_id: dto.contact_lens_spec_id,
      axis_value: axisValue,
    });
    return this.repo.save(axis);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const axis = await this.repo.findOneBy({ id });
    if (!axis) {
      throw new NotFoundException(
        `Khong tim thay contact lens axis voi id: ${id}`,
      );
    }
    return axis;
  }

  async update(id: number, dto: UpdateContactLensAxisDto) {
    const axis = await this.findOne(id);
    const updated = Object.assign(axis, dto);
    return this.repo.save(updated);
  }

  async remove(id: number) {
    const axis = await this.findOne(id);
    return this.repo.remove(axis);
  }
}
