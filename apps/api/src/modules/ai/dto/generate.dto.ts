import { IsString, IsEnum, IsOptional, IsArray, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  prompt: string;

  @ApiProperty({ enum: ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'YOUTUBE'], isArray: true })
  @IsArray()
  platforms: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  brandVoice?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeHashtags?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  includeEmojis?: boolean;
}

export class RepurposeContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  originalContent: string;

  @ApiProperty()
  @IsString()
  originalPlatform: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  targetPlatforms: string[];
}

export class HashtagSuggestionsDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  niche?: string;
}

export class AnalyzeContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiProperty({ required: false, enum: ['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN'] })
  @IsEnum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'LINKEDIN', 'TIKTOK', 'YOUTUBE'])
  @IsOptional()
  platform?: string;
}

export class RewriteContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiProperty({ enum: ['professional', 'casual', 'humorous', 'inspirational', 'educational', 'promotional'] })
  @IsEnum(['professional', 'casual', 'humorous', 'inspirational', 'educational', 'promotional'])
  tone: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  platforms?: string[];
}
