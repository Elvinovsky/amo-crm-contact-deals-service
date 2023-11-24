import { Test, TestingModule } from '@nestjs/testing';
import { AmoCrmController } from './amo-crm.controller';

describe('AmoCrmController', () => {
  let controller: AmoCrmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmoCrmController],
    }).compile();

    controller = module.get<AmoCrmController>(AmoCrmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
