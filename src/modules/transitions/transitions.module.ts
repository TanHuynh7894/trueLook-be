import { Module } from '@nestjs/common';
import { TransitionsService } from './transitions.service';
import { TransitionsController } from './transitions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipping } from '../shipping/entities/shipping.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Transition } from './entities/transition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transition, Shipping, Payment])],
  controllers: [TransitionsController],
  providers: [TransitionsService],
})
export class TransitionsModule {}
