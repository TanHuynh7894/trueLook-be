import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminUpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
