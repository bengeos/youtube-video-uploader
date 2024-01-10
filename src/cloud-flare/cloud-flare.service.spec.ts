import { Test, TestingModule } from '@nestjs/testing';
import { CloudFlareService } from './cloud-flare.service';

describe('CloudFlareService', () => {
  let service: CloudFlareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudFlareService],
    }).compile();

    service = module.get<CloudFlareService>(CloudFlareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
