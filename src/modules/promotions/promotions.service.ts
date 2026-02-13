import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto) {
    const newPromotion = this.promotionsRepository.create(createPromotionDto);
    return await this.promotionsRepository.save(newPromotion);
  }

  findAll() {
    return this.promotionsRepository.find();
  }

  async findOne(id: string) {
    const promotion = await this.promotionsRepository.findOneBy({ id });
    if (!promotion) {
      throw new NotFoundException(`Promotion with id ${id} not found`);
    }
    return promotion;
  }

  async update(id: string, updatePromotionDto: UpdatePromotionDto) {
    await this.promotionsRepository.update(id, updatePromotionDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const result = await this.promotionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with id ${id} not found for delete`);
    }
    return {
      message: `Deleted promotion with id: ${id}`,
      statusCode: 200,
    };
  }
}
