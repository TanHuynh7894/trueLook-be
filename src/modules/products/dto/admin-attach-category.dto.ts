import { IsNotEmpty, IsString } from 'class-validator';

export class AdminAttachCategoryDto {
  @IsString()
  @IsNotEmpty()
  category_id: string;
}
