import { Controller, Get, Query, Res } from '@nestjs/common';
import { AuthStorageService } from './auth-storage.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthStorageService) {}
  @Get('callback')
  async handleCallback(@Query('code') authCode: string, @Res() res) {
    this.authService.setAuthCode(authCode);
    res.send('Authorization Code Received Successfully!!!');
  }
}
