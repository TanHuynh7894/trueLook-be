import { Injectable } from '@nestjs/common';
import { CreateSupersetDto } from './dto/create-superset.dto';
import { UpdateSupersetDto } from './dto/update-superset.dto';

@Injectable()
export class SupersetService {
  create(createSupersetDto: CreateSupersetDto) {
    return 'This action adds a new superset';
  }

  findAll() {
    return `This action returns all superset`;
  }

  findOne(id: number) {
    return `This action returns a #${id} superset`;
  }

  update(id: number, updateSupersetDto: UpdateSupersetDto) {
    return `This action updates a #${id} superset`;
  }

  remove(id: number) {
    return `This action removes a #${id} superset`;
  }
}
