import { Test, TestingModule } from '@nestjs/testing';
import { AmoCrmService } from './amo-crm.service';

describe('AmoCrmService', () => {
  let service: AmoCrmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AmoCrmService],
    }).compile();

    service = module.get<AmoCrmService>(AmoCrmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
