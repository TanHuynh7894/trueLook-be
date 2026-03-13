import { Module } from '@nestjs/common';
import { ShippingServicesService } from './shipping_services.service';
import { ShippingServicesController } from './shipping_services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './entities/shipping_service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingService])],
  controllers: [ShippingServicesController],
  providers: [ShippingServicesService],
  exports: [ShippingServicesService],
})
export class ShippingServicesModule {}
