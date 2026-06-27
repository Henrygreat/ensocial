import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteMemberDto, UpdateMemberRoleDto } from './dto/invite-member.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller({ path: 'organizations', version: '1' })
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get(':orgId')
  @ApiOperation({ summary: 'Get organization details' })
  async getOrganization(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return { data: await this.orgsService.getOrganization(orgId, user.sub) };
  }

  @Patch(':orgId')
  @ApiOperation({ summary: 'Update organization' })
  async updateOrganization(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.orgsService.updateOrganization(orgId, user.sub, dto) };
  }

  @Get(':orgId/members')
  @ApiOperation({ summary: 'List organization members' })
  async getMembers(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return { data: await this.orgsService.getMembers(orgId, user.sub) };
  }

  @Post(':orgId/members/invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite a member to the organization' })
  async inviteMember(
    @Param('orgId') orgId: string,
    @Body() dto: InviteMemberDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.orgsService.inviteMember(orgId, user.sub, dto) };
  }

  @Patch(':orgId/members/:userId')
  @ApiOperation({ summary: "Update a member's role" })
  async updateMemberRole(
    @Param('orgId') orgId: string,
    @Param('userId') targetUserId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.orgsService.updateMemberRole(orgId, user.sub, targetUserId, dto) };
  }

  @Delete(':orgId/members/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  async removeMember(
    @Param('orgId') orgId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.orgsService.removeMember(orgId, user.sub, targetUserId);
  }
}
