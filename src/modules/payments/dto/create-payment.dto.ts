import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}