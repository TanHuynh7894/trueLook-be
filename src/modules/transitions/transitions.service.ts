import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transition } from './entities/transition.entity';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';

@Injectable()
export class TransitionsService {
  constructor(
    @InjectRepository(Transition)
    private readonly repo: Repository<Transition>,
  ) {}

  async create(dto: CreateTransitionDto): Promise<Transition> {
    const transition = this.repo.create(dto);
    return await this.repo.save(transition);
  }

  async findAll(): Promise<Transition[]> {
    return await this.repo.find({
      relations: ['shipping', 'payment'],
      order: { update_time: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transition> {
    const transition = await this.repo.findOne({
      where: { id },
      relations: ['shipping', 'payment'],
    });
    if (!transition) throw new NotFoundException(`Không tìm thấy hành trình ${id}`);
    return transition;
  }

  async update(id: string, dto: UpdateTransitionDto): Promise<Transition> {
    const transition = await this.findOne(id);
    const updated = Object.assign(transition, dto);
    return await this.repo.save(updated);
  }

  async remove(id: string) {
    const transition = await this.findOne(id);
    await this.repo.remove(transition);
    return { message: `Đã xóa thành công log ${id}` };
  }
}