import { Module } from '@nestjs/common';
import { ShippingProvidersService } from './shipping_providers.service';
import { ShippingProvidersController } from './shipping_providers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingProvider } from './entities/shipping_provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingProvider])],
  controllers: [ShippingProvidersController],
  providers: [ShippingProvidersService],
  exports: [ShippingProvidersService],
})
export class ShippingProvidersModule {}
