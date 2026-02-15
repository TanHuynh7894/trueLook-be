import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateRxLensSpecDto {
  @IsString() @IsNotEmpty()
  id: string;

  @IsString() @IsNotEmpty()
  product_id: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsString()
  material?: string;

  @IsOptional() @IsNumber()
  lens_width?: number;

  @IsOptional() @IsNumber()
  min_sphere?: number;

  @IsOptional() @IsNumber()
  max_sphere?: number;

  @IsOptional() @IsNumber()
  min_cylinder?: number;

  @IsOptional() @IsNumber()
  max_cylinder?: number;

  @IsOptional() @IsString()
  status?: string;
}