import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { MediaService } from './media.service';

@Module({
  controllers: [ContentController],
  providers: [ContentService, MediaService],
  exports: [ContentService, MediaService],
})
export class ContentModule {}
