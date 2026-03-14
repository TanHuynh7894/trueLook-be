import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Logger,
  HttpCode,
  Res
} from '@nestjs/common';

import type { Response } from 'express';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {

  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentService: PaymentsService
  ) {}

  
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

  
  @Get('success')
  async paymentSuccess(
    @Query() query: any,
    @Res() res: Response
  ) {

    this.logger.log('====== PAYMENT SUCCESS REDIRECT ======');
    this.logger.log(query);

    return res.json({
      message: "Payment success",
      data: query
    });

  }

  
  @Get('cancel')
  async paymentCancel(
    @Query() query: any,
    @Res() res: Response
  ) {

    this.logger.warn('====== PAYMENT CANCEL REDIRECT ======');
    this.logger.warn(query);

    return res.json({
      message: "Payment cancelled",
      data: query
    });

  }

}