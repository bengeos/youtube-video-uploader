import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CloudFlareService } from './cloud-flare/cloud-flare.service';
import { YoutubeService } from './youtube/youtube.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cloudFlareService: CloudFlareService,
    private readonly youtubeService: YoutubeService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('download')
  async downloadFile(@Query('fileId') fileId: string) {
    const filePath = await this.cloudFlareService.downloadFile(fileId);
    return { filePath: filePath };
  }

  @Get('upload')
  async uploadFile(
    @Query('token') token: string,
    @Query('filePath') filePath: string,
    @Query('channelId') channelId: string,
  ) {
    const response = await this.youtubeService.uploadVideo(
      token,
      filePath,
      channelId,
    );
    return { youtube: response };
  }

  @Get('download-upload')
  async downloadUploadFile(
    @Query('fileId') fileId: string,
    @Query('token') token: string,
    @Query('channelId') channelId: string,
  ) {
    const filePath = await this.cloudFlareService.downloadFile(fileId);
    const response = await this.youtubeService.uploadVideo(
      token,
      filePath,
      channelId,
    );
    return { youtube: response };
  }
}
