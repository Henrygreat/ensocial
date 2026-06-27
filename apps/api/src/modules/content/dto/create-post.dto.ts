import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2200)
  firstComment?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  socialAccountIds: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @ApiProperty({ enum: ['DRAFT', 'SCHEDULED'], required: false })
  @IsEnum(['DRAFT', 'SCHEDULED'])
  @IsOptional()
  status?: 'DRAFT' | 'SCHEDULED';

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;
}
