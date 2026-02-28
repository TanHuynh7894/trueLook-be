import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShippingServicesService } from './shipping_services.service';
import { CreateShippingServiceDto } from './dto/create-shipping_service.dto';
import { UpdateShippingServiceDto } from './dto/update-shipping_service.dto';
import { ApiExcludeController } from '@nestjs/swagger';
@ApiExcludeController()
@Controller('shipping-services')
export class ShippingServicesController {
  constructor(private readonly shippingServicesService: ShippingServicesService) {}

  @Post('create')
  create(@Body() createShippingServiceDto: CreateShippingServiceDto) {
    return this.shippingServicesService.create(createShippingServiceDto);
  }

  @Get('findAll')
  findAll() {
    return this.shippingServicesService.findAll();
  }

  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.shippingServicesService.findOne(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateShippingServiceDto: UpdateShippingServiceDto) {
    return this.shippingServicesService.update(id, updateShippingServiceDto);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.shippingServicesService.remove(id);
  }
}
