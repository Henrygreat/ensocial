import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { WorkspacesController } from '../workspaces/workspaces.controller';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Module({
  controllers: [OrganizationsController, WorkspacesController],
  providers: [OrganizationsService, WorkspacesService],
  exports: [OrganizationsService, WorkspacesService],
})
export class OrganizationsModule {}
