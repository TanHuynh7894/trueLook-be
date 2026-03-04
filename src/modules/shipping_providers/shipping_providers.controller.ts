import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShippingProvidersService } from './shipping_providers.service';
import { CreateShippingProviderDto } from './dto/create-shipping_provider.dto';
import { UpdateShippingProviderDto } from './dto/update-shipping_provider.dto';
import { ApiExcludeController } from '@nestjs/swagger';
@ApiExcludeController()
@Controller('shipping-providers')
export class ShippingProvidersController {
  constructor(
    private readonly shippingProvidersService: ShippingProvidersService,
  ) {}

  @Post('create')
  create(@Body() createShippingProviderDto: CreateShippingProviderDto) {
    return this.shippingProvidersService.create(createShippingProviderDto);
  }

  @Get('findAll')
  findAll() {
    return this.shippingProvidersService.findAll();
  }

  @Get('findOne/:id')
  findOne(@Param('id') id: string) {
    return this.shippingProvidersService.findOne(id);
  }

  @Patch('update/:id')
  update(
    @Param('id') id: string,
    @Body() updateShippingProviderDto: UpdateShippingProviderDto,
  ) {
    return this.shippingProvidersService.update(id, updateShippingProviderDto);
  }

  @Delete('remove/:id')
  remove(@Param('id') id: string) {
    return this.shippingProvidersService.remove(id);
  }
}
