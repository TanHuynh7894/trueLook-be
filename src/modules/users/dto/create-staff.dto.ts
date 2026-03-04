import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStaffDto extends CreateUserDto {
  @IsNotEmpty()
  @IsString()
  roleName: string;
}
