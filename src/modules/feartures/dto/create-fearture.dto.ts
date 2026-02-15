import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFeatureDto {
  @IsString() @IsNotEmpty()
  id: string;

  @IsString() @IsNotEmpty()
  rx_lens_id: string;

  @IsString() @IsNotEmpty()
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  status?: string;
}