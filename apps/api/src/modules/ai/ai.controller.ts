import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  GenerateContentDto,
  RepurposeContentDto,
  HashtagSuggestionsDto,
  AnalyzeContentDto,
  RewriteContentDto,
} from './dto/generate.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate social media content with Claude' })
  async generate(@Body() dto: GenerateContentDto) {
    return { data: await this.aiService.generateContent(dto) };
  }

  @Post('repurpose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Repurpose content across platforms' })
  async repurpose(@Body() dto: RepurposeContentDto) {
    return { data: await this.aiService.repurposeContent(dto) };
  }

  @Post('hashtags')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suggest hashtags for content' })
  async hashtags(@Body() dto: HashtagSuggestionsDto) {
    return { data: await this.aiService.suggestHashtags(dto) };
  }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze content performance potential' })
  async analyze(@Body() dto: AnalyzeContentDto) {
    return { data: await this.aiService.analyzeContent(dto) };
  }

  @Post('rewrite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rewrite content with a different tone' })
  async rewrite(@Body() dto: RewriteContentDto) {
    return { data: await this.aiService.rewriteContent(dto) };
  }

  @Get('best-times')
  @ApiOperation({ summary: 'Get best posting times for a platform' })
  async bestTimes(
    @Query('platform') platform: string,
    @Query('accountId') accountId?: string,
  ) {
    return { data: await this.aiService.getBestPostingTimes(platform, accountId) };
  }
}
