import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Logger,
} from '@nestjs/common';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiExcludeController } from '@nestjs/swagger';


@Controller('payments')
export class PaymentsController {

  private logger = new Logger(PaymentsController.name);

  constructor(private readonly paymentService: PaymentsService) { }

  /**
   * CREATE PAYMENT
   */
  @Post()
  create(@Body() createDto: CreatePaymentDto) {
    return this.paymentService.create(createDto);
  }

  /**
   * PAYOS WEBHOOK
   */
  @Post('webhook')
  async webhook(@Body() body: any) {

    this.logger.log('====== PAYOS WEBHOOK RECEIVED ======');

    this.logger.log('BODY:');
    this.logger.log(JSON.stringify(body, null, 2));

    try {

      const result = await this.paymentService.handleWebhook(body);

      this.logger.log('Webhook processed successfully');

      return {
        success: true,
      };

    } catch (error) {

      this.logger.error('Webhook error');
      this.logger.error(error);

      return {
        success: false,
        error: error.message,
      };

    }
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePaymentDto,
  ) {
    return this.paymentService.update(id, updateDto);
  }
}