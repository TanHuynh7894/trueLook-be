import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateContactLensSpecDto {
  @IsString() @IsNotEmpty()
  id: string;

  @IsString() @IsNotEmpty()
  product_id: string;

  @IsOptional() @IsNumber()
  base_curve?: number;

  @IsOptional() @IsNumber()
  diameter?: number;

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