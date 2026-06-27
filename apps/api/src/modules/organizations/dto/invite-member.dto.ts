import { IsEmail, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InviteMemberDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['ADMIN', 'MEMBER'] })
  @IsEnum(['ADMIN', 'MEMBER'])
  role: 'ADMIN' | 'MEMBER';
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['ADMIN', 'MEMBER'] })
  @IsEnum(['ADMIN', 'MEMBER'])
  role: 'ADMIN' | 'MEMBER';
}
