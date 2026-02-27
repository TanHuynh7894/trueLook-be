import { IsNotEmpty, IsString } from 'class-validator';

export class AdminCreateImageDto {
  @IsString()
  @IsNotEmpty()
  path: string;
}
