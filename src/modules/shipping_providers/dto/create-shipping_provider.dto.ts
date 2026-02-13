import { IsNotEmpty, IsString } from 'class-validator';

export class CreateShippingProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}
