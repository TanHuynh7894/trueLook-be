import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsEnum } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}


export enum OrderStatus {
  PENDING = 'Pending',
  CONFIRM = 'Confirm',
  SHIPPING = 'Shipping',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}