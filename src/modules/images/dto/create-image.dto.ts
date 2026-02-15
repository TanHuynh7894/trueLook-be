import { IsNotEmpty, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  variant_id: string;

  @IsString()
  @IsNotEmpty()
  path: string;
}
