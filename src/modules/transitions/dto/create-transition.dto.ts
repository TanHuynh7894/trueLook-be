import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateTransitionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  shipping_id: string;

  @IsString()
  @IsOptional()
  payment_id?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsDateString()
  @IsOptional()
  update_time?: Date;

  @IsString()
  @IsOptional()
  note?: string;
}