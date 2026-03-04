import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactLensSpec } from './entities/contact-lens-spec.entity';
import { CreateContactLensSpecDto } from './dto/create-contact-lens-spec.dto';
import { UpdateContactLensSpecDto } from './dto/update-contact-lens-spec.dto';
import { ContactLensSpecSearchQueryDto } from './dto/contact-lens-spec-search-query.dto';
import { ContactLensAxis } from '../contact_lens_axis/entities/contact_lens_axi.entity';

@Injectable()
export class ContactLensSpecsService {
  constructor(
    @InjectRepository(ContactLensSpec)
    private readonly repo: Repository<ContactLensSpec>,
    @InjectRepository(ContactLensAxis)
    private readonly axisRepo: Repository<ContactLensAxis>,
  ) {}

  create(dto: CreateContactLensSpecDto) {
    const spec = this.repo.create({
      id: `CLS${Date.now().toString().slice(-12)}`,
      ...dto,
    });
    return this.repo.save(spec);
  }

  async findAll(query: ContactLensSpecSearchQueryDto) {
    const qb = this.repo
      .createQueryBuilder('contactLensSpec')
      .leftJoin('contactLensSpec.product', 'product');

    if (query.product_name) {
      qb.andWhere('LOWER(product.name) LIKE :productName', {
        productName: `%${query.product_name.toLowerCase()}%`,
      });
    }

    if (query.base_curve !== undefined) {
      qb.andWhere('contactLensSpec.base_curve = :baseCurve', {
        baseCurve: query.base_curve,
      });
    }

    if (query.diameter !== undefined) {
      qb.andWhere('contactLensSpec.diameter = :diameter', {
        diameter: query.diameter,
      });
    }

    if (query.sphere_min !== undefined) {
      qb.andWhere('contactLensSpec.min_sphere <= :sphereMin', {
        sphereMin: query.sphere_min,
      });
    }

    if (query.sphere_max !== undefined) {
      qb.andWhere('contactLensSpec.max_sphere >= :sphereMax', {
        sphereMax: query.sphere_max,
      });
    }

    if (query.cylinder_min !== undefined) {
      qb.andWhere('contactLensSpec.min_cylinder <= :cylinderMin', {
        cylinderMin: query.cylinder_min,
      });
    }

    if (query.cylinder_max !== undefined) {
      qb.andWhere('contactLensSpec.max_cylinder >= :cylinderMax', {
        cylinderMax: query.cylinder_max,
      });
    }

    if (query.axis !== undefined) {
      qb.andWhere('contactLensSpec.axis_min = :axis', {
        axis: query.axis,
      });
    }

    const specs = await qb.getMany();
    if (!specs.length) return [];

    const specIds = specs.map((spec) => spec.id);
    const axis = await this.axisRepo.find({
      where: specIds.map((id) => ({ contact_lens_spec_id: id })),
    });
    const axisBySpec = axis.reduce<Record<string, ContactLensAxis[]>>(
      (acc, item) => {
        if (!acc[item.contact_lens_spec_id])
          acc[item.contact_lens_spec_id] = [];
        acc[item.contact_lens_spec_id].push(item);
        return acc;
      },
      {},
    );

    return specs.map((spec) => ({
      ...spec,
      contact_lens_axis: axisBySpec[spec.id] || [],
    }));
  }

  async findOne(id: string) {
    const spec = await this.repo.findOneBy({ id });
    if (!spec) {
      throw new NotFoundException(
        `Khong tim thay contact lens spec voi id: ${id}`,
      );
    }

    const axis = await this.axisRepo.find({
      where: { contact_lens_spec_id: spec.id },
    });
    return {
      ...spec,
      contact_lens_axis: axis,
    };
  }

  async update(id: string, dto: UpdateContactLensSpecDto) {
    const spec = await this.repo.findOneBy({ id });
    if (!spec) {
      throw new NotFoundException(
        `Khong tim thay contact lens spec voi id: ${id}`,
      );
    }
    const updated = Object.assign(spec, dto);
    return this.repo.save(updated);
  }

  async remove(id: string) {
    const spec = await this.repo.findOneBy({ id });
    if (!spec) {
      throw new NotFoundException(
        `Khong tim thay contact lens spec voi id: ${id}`,
      );
    }
    await this.repo.update(id, { status: 'Inactive' });
    return {
      message: `Da chuyen contact lens spec ${id} sang Inactive`,
      statusCode: 200,
    };
  }
}
