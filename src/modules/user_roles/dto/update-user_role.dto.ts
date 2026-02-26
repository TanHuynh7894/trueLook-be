import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ 
    example: ['System Admin', 'Manager'],
    description: 'Danh sách các quyền muốn gán cho User' 
  })
  @IsArray()
  @IsString({ each: true })
  roleIds: string[];
}