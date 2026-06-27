import { Module } from '@nestjs/common';
import { SocialController } from './social.controller';
import { SocialService } from './social.service';
import { FacebookConnector } from './connectors/facebook.connector';
import { InstagramConnector } from './connectors/instagram.connector';
import { TwitterConnector } from './connectors/twitter.connector';
import { LinkedInConnector } from './connectors/linkedin.connector';

@Module({
  controllers: [SocialController],
  providers: [
    SocialService,
    FacebookConnector,
    InstagramConnector,
    TwitterConnector,
    LinkedInConnector,
  ],
  exports: [SocialService],
})
export class SocialModule {}
