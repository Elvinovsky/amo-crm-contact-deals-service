import { Controller, Get, Query } from '@nestjs/common';
import { AmoCRMService } from './amo-crm.service';
import { QueryInputModel } from '../dto/query.model';

@Controller('amo-crm')
export class AmoCRMController {
  constructor(private readonly amoCRMService: AmoCRMService) {}

  @Get()
  async handleAmoCRMRequest(@Query() query: QueryInputModel): Promise<string> {
    return this.amoCRMService.processAmoCRMRequest(
      query.name,
      query.email,
      query.phone,
    );
  }
}
