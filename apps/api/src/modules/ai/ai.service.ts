import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';
import type {
  GenerateContentDto,
  RepurposeContentDto,
  HashtagSuggestionsDto,
  AnalyzeContentDto,
  RewriteContentDto,
} from './dto/generate.dto';

const PLATFORM_LIMITS: Record<string, number> = {
  TWITTER: 280,
  INSTAGRAM: 2200,
  FACEBOOK: 63206,
  LINKEDIN: 3000,
  TIKTOK: 2200,
  YOUTUBE: 5000,
};

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Anthropic;

  constructor(private readonly config: ConfigService) {
    this.client = new Anthropic({
      apiKey: config.get<string>('anthropic.apiKey'),
    });
  }

  async generateContent(dto: GenerateContentDto) {
    const platformConstraints = dto.platforms
      .map((p) => `${p}: max ${PLATFORM_LIMITS[p] ?? 2200} characters`)
      .join(', ');

    const systemPrompt = `You are an expert social media content creator.
Create engaging, platform-optimized content that drives meaningful engagement.
${dto.brandVoice ? `Brand voice: ${dto.brandVoice}` : ''}
${dto.includeEmojis ? 'Include relevant emojis to boost engagement.' : 'Do not include emojis.'}
Respond with JSON only.`;

    const userPrompt = `Create social media posts for: ${dto.prompt}

Target platforms: ${dto.platforms.join(', ')}
Character limits: ${platformConstraints}
${dto.includeHashtags ? 'Include 5-10 relevant hashtags per platform.' : ''}

Return JSON in this exact format:
{
  "posts": {
    "<PLATFORM>": {
      "content": "the post content",
      "hashtags": ["tag1", "tag2"],
      "estimatedEngagement": "high|medium|low",
      "tips": "brief platform-specific optimization tip"
    }
  }
}`;

    return this.callClaude(systemPrompt, userPrompt);
  }

  async repurposeContent(dto: RepurposeContentDto) {
    const systemPrompt = `You are an expert at adapting content across social media platforms.
Maintain the core message while optimizing format, tone, and length for each target platform.
Respond with JSON only.`;

    const userPrompt = `Repurpose this ${dto.originalPlatform} content for other platforms:

Original content:
${dto.originalContent}

Target platforms: ${dto.targetPlatforms.join(', ')}

Return JSON:
{
  "repurposed": {
    "<PLATFORM>": {
      "content": "adapted content",
      "changes": "brief description of what changed and why"
    }
  }
}`;

    return this.callClaude(systemPrompt, userPrompt);
  }

  async suggestHashtags(dto: HashtagSuggestionsDto) {
    const systemPrompt = `You are a hashtag research expert. Suggest hashtags that maximize reach and engagement.
Mix popular, niche, and trending hashtags. Respond with JSON only.`;

    const userPrompt = `Suggest hashtags for this content:
${dto.content}
${dto.niche ? `Niche: ${dto.niche}` : ''}

Return JSON:
{
  "hashtags": {
    "high_volume": ["tag1", "tag2"],
    "medium_volume": ["tag3", "tag4"],
    "niche": ["tag5", "tag6"],
    "trending": ["tag7", "tag8"],
    "recommended_mix": ["tag1", "tag3", "tag5"],
    "insight": "brief strategy tip"
  }
}`;

    return this.callClaude(systemPrompt, userPrompt);
  }

  async analyzeContent(dto: AnalyzeContentDto) {
    const systemPrompt = `You are a social media performance analyst.
Analyze content and predict performance based on best practices. Respond with JSON only.`;

    const userPrompt = `Analyze this content for social media performance:
${dto.platform ? `Platform: ${dto.platform}` : ''}

Content:
${dto.content}

Return JSON:
{
  "analysis": {
    "score": 85,
    "strengths": ["strength 1", "strength 2"],
    "improvements": ["improvement 1", "improvement 2"],
    "estimatedReach": "high|medium|low",
    "bestPostingTimes": ["Monday 9AM", "Wednesday 6PM"],
    "tone": "professional|casual|etc",
    "readabilityScore": 90,
    "callToAction": "present|missing|weak",
    "rewrite": "optional improved version"
  }
}`;

    return this.callClaude(systemPrompt, userPrompt);
  }

  async rewriteContent(dto: RewriteContentDto) {
    const platformConstraints = dto.platforms
      ? dto.platforms.map((p) => `${p}: ${PLATFORM_LIMITS[p] ?? 2200} chars`).join(', ')
      : '';

    const systemPrompt = `You are an expert copywriter specializing in social media.
Rewrite content to match the requested tone while maintaining the core message. Respond with JSON only.`;

    const userPrompt = `Rewrite this content with a ${dto.tone} tone:

Original:
${dto.content}

${platformConstraints ? `Optimize for: ${platformConstraints}` : ''}

Return JSON:
{
  "rewritten": "the rewritten content",
  "tone": "${dto.tone}",
  "changes": "brief explanation of changes made"
}`;

    return this.callClaude(systemPrompt, userPrompt);
  }

  async getBestPostingTimes(platform: string, accountId?: string) {
    // In production, this would analyze actual account data from analytics
    const defaults: Record<string, string[]> = {
      INSTAGRAM: ['Monday 6PM', 'Tuesday 9AM', 'Friday 11AM', 'Sunday 7PM'],
      FACEBOOK: ['Wednesday 1PM', 'Thursday 12PM', 'Friday 3PM'],
      TWITTER: ['Tuesday 9AM', 'Wednesday 12PM', 'Thursday 5PM', 'Friday 9AM'],
      LINKEDIN: ['Tuesday 10AM', 'Wednesday 9AM', 'Thursday 1PM'],
    };

    return {
      platform,
      accountId,
      bestTimes: defaults[platform] ?? ['Monday 9AM', 'Wednesday 12PM', 'Friday 3PM'],
      insight: 'Based on industry benchmarks. Connect analytics for personalized recommendations.',
    };
  }

  private async callClaude(systemPrompt: string, userPrompt: string) {
    try {
      const message = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');

      return JSON.parse(jsonMatch[0]) as unknown;
    } catch (error) {
      this.logger.error('Claude API error', error);
      throw new ServiceUnavailableException('AI service temporarily unavailable');
    }
  }
}
