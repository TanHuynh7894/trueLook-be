import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateFrameSpecDto {
  @IsString() @IsNotEmpty()
  id: string;

  @IsString() @IsNotEmpty()
  product_id: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsString()
  material?: string;

  @IsOptional() @IsNumber()
  a?: number;

  @IsOptional() @IsNumber()
  b?: number;

  @IsOptional() @IsNumber()
  dbl?: number;

  @IsOptional() @IsString()
  shape?: string;

  @IsOptional() @IsNumber()
  weight?: number;

  @IsOptional() @IsString()
  status?: string;
}