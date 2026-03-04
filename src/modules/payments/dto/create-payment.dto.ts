import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  method: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsDateString()
  payment_date?: Date;
}
