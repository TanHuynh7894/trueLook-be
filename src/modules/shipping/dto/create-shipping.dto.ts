import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateShippingDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsNumber()
  ship_fee: number;

  @IsNumber()
  cod_amount: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  provider_id?: string;

  @IsOptional()
  @IsString()
  service_id?: string;
}
