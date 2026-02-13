import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShippingServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  service_code: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
