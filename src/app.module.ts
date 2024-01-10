import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { YoutubeService } from './youtube/youtube.service';
import { CloudFlareService } from './cloud-flare/cloud-flare.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, YoutubeService, CloudFlareService],
})
export class AppModule {}
