import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from './entities/shipping.entity';
import { NhanhConfig } from './entities/nhanh-config.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Shipping, NhanhConfig])],
  controllers: [ShippingController],
  providers: [ShippingService],
})
export class ShippingModule {}
