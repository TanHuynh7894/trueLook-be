import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {

  @IsString()
  @IsNotEmpty()
  orderId: string;

}