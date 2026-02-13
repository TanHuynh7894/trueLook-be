import { Module } from '@nestjs/common';
import { ShippingProvidersService } from './shipping_providers.service';
import { ShippingProvidersController } from './shipping_providers.controller';

@Module({
  controllers: [ShippingProvidersController],
  providers: [ShippingProvidersService],
})
export class ShippingProvidersModule {}
