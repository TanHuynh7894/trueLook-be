import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { ApiExcludeController } from '@nestjs/swagger';
@ApiExcludeController()
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) { }

  @Post('webhook')
  handleWebhook(@Body() body: any) {

    console.log('Nhanh webhook:', body);

    return {
      success: true
    };
  }

  @Post()
  create(@Body() createShippingDto: CreateShippingDto) {
    return this.shippingService.create(createShippingDto);
  }
}
