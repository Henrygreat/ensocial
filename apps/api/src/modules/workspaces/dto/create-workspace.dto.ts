import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateWorkspaceDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
