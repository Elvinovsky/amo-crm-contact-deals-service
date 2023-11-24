// this module should be first line of app.module.ts
import { configModule } from './configuration/config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AmoCRMController } from './amo-crm/amo-crm.controller';
import { AmoCRMService } from './amo-crm/amo-crm.service';
import { HttpModule } from '@nestjs/axios';
import { AuthStorageService } from './auth/auth-storage.service';
import { AuthController } from './auth/auth.controller';
import { AmoCrmAdapter } from './adapters/amo-crm-adapter';

@Module({
  imports: [configModule, HttpModule],
  controllers: [AppController, AmoCRMController, AuthController],
  providers: [AppService, AmoCRMService, AmoCrmAdapter, AuthStorageService],
})
export class AppModule {}
