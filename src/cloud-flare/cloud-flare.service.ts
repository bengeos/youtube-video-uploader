import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CloudFlareService {
  private apiUrl = 'https://api.cloudflare.com/client/v4';
  private readonly downloadDirectory = path.join(__dirname, '..', 'downloads');

  constructor(private configService: ConfigService) {
    if (!fs.existsSync(this.downloadDirectory)) {
      fs.mkdirSync(this.downloadDirectory, { recursive: true });
    }
  }

  async downloadFile(fileId: string): Promise<string> {
    const CLOUDFLARE_API_TOKEN = this.configService.get<string>(
      'CLOUDFLARE_API_TOKEN',
    );
    const CLOUDFLARE_ACCOUNT_ID = this.configService.get<string>(
      'CLOUDFLARE_ACCOUNT_ID',
    );
    const url = `${this.apiUrl}/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream/${fileId}/downloads`;
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });
    const fileUrl = res.data.result.default.url;
    const fileName = path.basename(fileUrl);
    const outputPath = path.join(this.downloadDirectory, fileName);

    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    });

    const totalLength = response.headers['content-length'];
    let downloadedLength = 0;
    response.data.on('data', (chunk: Buffer) => {
      downloadedLength += chunk.length;
      const percentage = ((downloadedLength / totalLength) * 100).toFixed(2);
      console.log(`Downloaded: ${percentage}%`);
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(outputPath));
      writer.on('error', reject);
    });
  }
}
