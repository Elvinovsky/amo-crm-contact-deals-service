import { Controller, Get, Query } from '@nestjs/common';
import { AmoCRMService } from './amo-crm.service';

@Controller('amo-crm')
export class AmoCRMController {
  constructor(private readonly amoCRMService: AmoCRMService) {}

  @Get()
  async handleAmoCRMRequest(
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('phone') phone: string,
  ): Promise<string> {
    const result = await this.amoCRMService.processAmoCRMRequest(
      name,
      email,
      phone,
    );
    return result;
  }
}
