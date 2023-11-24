import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AmoCRMController } from './amo-crm/amo-crm.controller';
import { AmoCRMService } from './amo-crm/amo-crm.service';

@Module({
  imports: [],
  controllers: [AppController, AmoCRMController],
  providers: [AppService, AmoCRMService],
})
export class AppModule {}
