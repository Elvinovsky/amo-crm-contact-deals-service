import { Test, TestingModule } from '@nestjs/testing';
import { AmoCRMController } from './amo-crm.controller';

describe('AmoCrmController', () => {
  let controller: AmoCRMController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmoCRMController],
    }).compile();

    controller = module.get<AmoCRMController>(AmoCRMController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
