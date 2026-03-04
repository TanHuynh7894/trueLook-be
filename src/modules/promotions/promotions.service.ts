import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { SearchPromotionDto } from './dto/search-promotion.dto'; // 👈 NHỚ IMPORT CÁI NÀY
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

  // ==============================================================================
  // 1. DÀNH CHO ADMIN: Lấy tất cả (kể cả Inactive), tìm kiếm theo tên và số tiền
  // ==============================================================================
  async findAllForAdmin(queryDto: SearchPromotionDto) {
    const { name, money } = queryDto;
    const query = this.promotionsRepository.createQueryBuilder('promotion');

    // Tìm gần đúng theo tên (không phân biệt hoa thường với ILIKE)
    if (name) {
      query.andWhere('promotion.name ILIKE :name', { name: `%${name}%` });
    }

    // Nếu số tiền đơn hàng >= điều kiện (condition) thì mới lấy
    if (money !== undefined && money !== null) {
      query.andWhere('promotion.condition <= :money', { money });
    }

    // Nếu không truyền name hay money, nó sẽ tự động Get All
    return await query.getMany();
  }

  // ==============================================================================
  // 2. DÀNH CHO MANAGER/PUBLIC: Lọc tương tự nhưng CHỈ LẤY ACTIVE VÀ CÒN HẠN
  // ==============================================================================
  async findAllForManager(queryDto: SearchPromotionDto) {
    const { name, money } = queryDto;
    const currentDate = new Date();
    const query = this.promotionsRepository.createQueryBuilder('promotion');

    // Chặn kiên quyết: Phải là 'Active' và thời gian hiện tại phải nằm trong khung giờ KM
    query.andWhere('promotion.status = :status', { status: 'Active' })
         .andWhere('promotion.start_time <= :now', { now: currentDate })
         .andWhere('promotion.end_time >= :now', { now: currentDate });

    if (name) {
      query.andWhere('promotion.name ILIKE :name', { name: `%${name}%` });
    }

    if (money !== undefined && money !== null) {
      query.andWhere('promotion.condition <= :money', { money });
    }

    return await query.getMany();
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

  // ==============================================================================
  // 3. ĐỔI LOGIC REMOVE: Thay vì xóa hẳn, ta đổi status thành 'Inactive'
  // ==============================================================================
  async remove(id: string) {
    // Không dùng .delete() nữa, dùng .update() để đổi trạng thái
    const result = await this.promotionsRepository.update(id, { status: 'Inactive' });
    
    if (result.affected === 0) {
      throw new NotFoundException(`Promotion with id ${id} not found for delete`);
    }
    
    return {
      message: `Đã vô hiệu hóa thành công khuyến mãi ID: ${id}`,
      statusCode: 200,
    };
  }
}