import {
  Controller,
  Post,
  Body,
  Logger,
  HttpCode,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {

  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentService: PaymentsService
  ) { }

  /**
   * CREATE PAYMENT
   */
  @Post()
  async create(@Body() body: CreatePaymentDto) {

    const result = await this.paymentService.createPayment(
      body.orderId,
      body.promotionId
    );

    return {
      message: "Payment created",
      ...result
    };

  }

  /**
   * PAYOS WEBHOOK
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any) {

    this.logger.log('====== PAYOS WEBHOOK RECEIVED ======');

    try {

      await this.paymentService.handleWebhook(body);

      return {
        error: 0,
        message: "Webhook processed"
      };

    } catch (error) {

      this.logger.error(error);

      return {
        error: -1,
        message: error.message
      };

    }

  }

}