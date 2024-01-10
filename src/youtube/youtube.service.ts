import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import * as fs from 'fs';

interface Credential {
  client_secret: string;
  client_id: string;
  redirect_uris: string[];
}

@Injectable()
export class YoutubeService {
  private credential: Credential;

  constructor(private configService: ConfigService) {
    this.credential = {
      client_secret: this.configService.get<string>('CLIENT_SECRET'),
      client_id: this.configService.get<string>('CLIENT_ID'),
      redirect_uris: ['https://localhost:5357'],
    };
  }

  authorize(token: string) {
    const { client_secret, client_id, redirect_uris } = this.credential;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0],
    );
    oAuth2Client.setCredentials({
      access_token: token,
      scope: 'https://www.googleapis.com/auth/youtube.upload',
    });
    return oAuth2Client;
  }

  async uploadVideo(token: string, filePath: string, channelId: string) {
    const service = google.youtube('v3');
    const fileSize = fs.statSync(filePath).size;

    const response = await service.videos.insert(
      {
        auth: this.authorize(token),
        part: ['id', 'snippet', 'status'],
        notifySubscribers: false,
        requestBody: {
          snippet: {
            title: 'Test Video Upload',
            description: 'This is a test video uploaded via the YouTube API',
            channelId: channelId,
          },
          status: {
            privacyStatus: 'private',
          },
        },
        media: {
          body: fs.createReadStream(filePath),
        },
      },
      {
        onUploadProgress: (evt) => {
          const progress = (evt.bytesRead / fileSize) * 100;
          console.log(`${Math.round(progress)}% complete`);
        },
      },
    );
    console.log(response);
  }
}
