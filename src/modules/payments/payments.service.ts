import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PayOS } from '@payos/node';

import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

import { Transition } from '../transitions/entities/transition.entity';

@Injectable()
export class PaymentsService {

  private payOS: PayOS;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Transition)
    private transitionRepository: Repository<Transition>,
  ) {

    this.payOS = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID!,
      apiKey: process.env.PAYOS_API_KEY!,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
    });

  }

  /**
   * CREATE PAYMENT
   */
  async create(dto: CreatePaymentDto) {

    const orderCode = Date.now();

    const paymentId = `PM${orderCode}`;

    /**
     * save payment
     */
    const payment = this.paymentRepository.create({
      id: paymentId,
      method: 'Bank Transfer',
      status: 'Pending',
      amount: dto.amount,
    });

    await this.paymentRepository.save(payment);

    /**
     * create payOS payment link
     */
    const paymentData = {
      orderCode: orderCode,
      amount: dto.amount,
      description: dto.description,

      items: [
        {
          name: "Order Payment",
          quantity: 1,
          price: dto.amount,
        },
      ],

      cancelUrl: process.env.PAYOS_CANCEL_URL!,
      returnUrl: process.env.PAYOS_RETURN_URL!,
    };

    const paymentLink = await this.payOS.paymentRequests.create(paymentData);

    return {
      payment_id: paymentId,
      order_code: orderCode,
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode,
    };
  }

  /**
   * GET ALL
   */
  findAll() {
    return this.paymentRepository.find();
  }

  /**
   * GET ONE
   */
  async findOne(id: string) {

    const payment = await this.paymentRepository.findOneBy({ id });

    if (!payment) {
      throw new NotFoundException(`Payment ${id} not found`);
    }

    return payment;
  }

  /**
   * UPDATE
   */
  async update(id: string, dto: UpdatePaymentDto) {

    const payment = await this.findOne(id);

    Object.assign(payment, dto);

    return await this.paymentRepository.save(payment);
  }

  /**
   * PAYOS WEBHOOK
   */
  async handleWebhook(body: any) {

    /**
     * verify webhook
     */
    const webhookData = await this.payOS.webhooks.verify(body);

    const orderCode = webhookData.orderCode;
    const reference = webhookData.reference;

    const paymentId = `PM${orderCode}`;
    const transitionId = `TS${orderCode}`;

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    /**
     * update payment
     */
    payment.status = "Completed";
    payment.payment_date = new Date();

    await this.paymentRepository.save(payment);

    /**
     * create transition
     */
    const transition = this.transitionRepository.create({
      id: transitionId,
      payment_id: paymentId,
      transition_payment: reference,
      create_at: new Date(),
      update_time: new Date(),
    });

    await this.transitionRepository.save(transition);

    return {
      message: "Payment completed",
    };
  }
}