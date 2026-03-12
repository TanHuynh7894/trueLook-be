import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PayOS } from '@payos/node';

import { Payment } from './entities/payment.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderDetail } from '../order_details/entities/order_detail.entity';
import { ProductVariant } from '../product_variants/entities/product_variant.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';
import { Transition } from '../transitions/entities/transition.entity';

@Injectable()
export class PaymentsService {

  private readonly logger = new Logger(PaymentsService.name);
  private payOS: PayOS;

  constructor(

    private dataSource: DataSource,

    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderDetail)
    private orderDetailRepo: Repository<OrderDetail>,

    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,

    @InjectRepository(Cart)
    private cartRepo: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepo: Repository<CartItem>,

    @InjectRepository(Transition)
    private transitionRepo: Repository<Transition>,

  ) {

    this.payOS = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID!,
      apiKey: process.env.PAYOS_API_KEY!,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
    });

  }

  /**
   * CREATE PAYMENT LINK
   */
  async createPayment(orderId: string) {

    const order = await this.orderRepo.findOne({
      where: { id: orderId }
    });

    if (!order) {
      throw new Error("Order not found");
    }

    const amount = Number(order.total);

    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid order amount");
    }

    const orderCode = Date.now();

    const payment = this.paymentRepo.create({
      id: orderCode.toString(),
      order_id: orderId,
      amount: amount,
      method: "Bank Transfer",
      status: "Pending"
    });

    await this.paymentRepo.save(payment);

    const body = {
      orderCode: orderCode,
      amount: amount,
      description: `Order ${orderId}`,
      items: [
        {
          name: "Order payment",
          quantity: 1,
          price: amount,
        }
      ],
      cancelUrl: process.env.PAYOS_CANCEL_URL!,
      returnUrl: process.env.PAYOS_RETURN_URL!,
    };

    this.logger.log(`Creating PayOS payment for order ${orderId}`);

    const paymentLink = await this.payOS.paymentRequests.create(body);

    return {
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: paymentLink.qrCode
    };

  }

  /**
   * WEBHOOK FROM PAYOS
   */
  async handleWebhook(body: any) {

    const data = await this.payOS.webhooks.verify(body);

    if (data.code !== "00") {
      this.logger.warn("Payment not successful");
      return;
    }

    const paymentId = data.orderCode.toString();

    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId }
    });

    if (!payment) {
      this.logger.warn("Payment not found");
      return;
    }

    if (payment.status === "Completed") {
      this.logger.log("Payment already completed");
      return;
    }

    payment.status = "Completed";
    payment.payment_date = new Date();

    await this.paymentRepo.save(payment);

    /**
     * Lưu transaction PayOS vào bảng transitions
     */
    const transition = this.transitionRepo.create({
      id: Date.now().toString(),
      payment_id: payment.id,
      transition_payment: data.reference,
      create_at: new Date(),
      update_time: new Date(),
    });

    await this.transitionRepo.save(transition);

    /**
     * confirm order
     */
    await this.confirmOrder(payment.order_id);

    this.logger.log(`Payment success ${payment.id}`);

  }

  /**
   * CONFIRM ORDER
   */
  async confirmOrder(orderId: string) {

    await this.dataSource.transaction(async manager => {

      const orderDetails = await manager.find(OrderDetail, {
        where: { order_id: orderId }
      });

      for (const item of orderDetails) {

        const variant = await manager.findOne(ProductVariant, {
          where: { id: item.variant_id }
        });

        if (!variant) continue;

        variant.quantity -= item.quantity;

        await manager.save(variant);

      }

      const order = await manager.findOne(Order, {
        where: { id: orderId }
      });

      if (!order) return;

      order.status = "Process";
      await manager.save(order);

      const cart = await manager.findOne(Cart, {
        where: { user_id: order.customer_id }
      });

      if (!cart) return;

      await manager.delete(CartItem, {
        cart_id: cart.id
      });

    });

  }

}