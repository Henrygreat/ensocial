import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MagicLinkRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}

export class MagicLinkVerifyDto {
  @ApiProperty()
  @IsString()
  @MinLength(32)
  token: string;
}
