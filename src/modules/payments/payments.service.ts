import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private repo: Repository<Payment>,
  ) {}

  async create(dto: CreatePaymentDto) {
    const payment = this.repo.create(dto);
    return await this.repo.save(payment);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const payment = await this.repo.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Payment ${id} không tồn tại`);
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    const updated = Object.assign(payment, dto);
    return await this.repo.save(updated);
  }

  async remove(id: string) {
    const payment = await this.findOne(id);
    return await this.repo.remove(payment);
  }
}
