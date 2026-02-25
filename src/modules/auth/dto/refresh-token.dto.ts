import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'chuoi-refresh-token-dai-ngoang' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}