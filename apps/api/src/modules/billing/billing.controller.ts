import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { IsString, IsEnum, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { JwtPayload } from '../../common/types';
import type { FastifyRequest } from 'fastify';

class CreateCheckoutDto {
  @ApiProperty({ enum: ['SOLO', 'PRO', 'AGENCY', 'ENTERPRISE'] })
  @IsEnum(['SOLO', 'PRO', 'AGENCY', 'ENTERPRISE'])
  plan: 'SOLO' | 'PRO' | 'AGENCY' | 'ENTERPRISE';

  @ApiProperty()
  @IsUrl()
  returnUrl: string;
}

class CreatePortalDto {
  @ApiProperty()
  @IsUrl()
  returnUrl: string;
}

@ApiTags('billing')
@ApiBearerAuth()
@Controller({ path: 'billing', version: '1' })
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Get current subscription' })
  async getSubscription(@CurrentUser() user: JwtPayload) {
    if (!user.orgId) return { data: { plan: 'FREE', subscription: null } };
    return { data: await this.billingService.getSubscription(user.orgId) };
  }

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createCheckout(@Body() dto: CreateCheckoutDto, @CurrentUser() user: JwtPayload) {
    if (!user.orgId) throw new Error('No org context');
    return { data: await this.billingService.createCheckoutSession(user.orgId, user.sub, dto.plan, dto.returnUrl) };
  }

  @Post('portal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe customer portal session' })
  async createPortal(@Body() dto: CreatePortalDto, @CurrentUser() user: JwtPayload) {
    if (!user.orgId) throw new Error('No org context');
    return { data: await this.billingService.createPortalSession(user.orgId, dto.returnUrl) };
  }

  @Public()
  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  async webhook(
    @Req() req: FastifyRequest & { rawBody: Buffer },
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req.rawBody, signature);
  }
}
