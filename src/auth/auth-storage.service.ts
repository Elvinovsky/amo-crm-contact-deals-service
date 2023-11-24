import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AmoCrmAdapter } from '../adapters/amo-crm-adapter';

@Injectable()
export class AuthStorageService {
  protected authCode: string;
  protected accessToken: string;
  protected refreshToken: string;

  constructor(
    @Inject(forwardRef(() => AmoCrmAdapter))
    private adapter: AmoCrmAdapter,
  ) {}

  // Установка кода авторизации
  setAuthCode(code: string): void {
    this.authCode = code;
  }

  // Получение кода авторизации
  getAuthCode(): string {
    return this.authCode;
  }

  // Аутентификация пользователя
  async authenticate() {
    // Проверка наличия токена
    if (!this.accessToken) {
      try {
        // Получение токенов через адаптер
        const tokens = await this.adapter.getAccessToken();
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
      } catch (error) {
        console.error('Authentication failed:', error);
        // Можно добавить обработку ошибок при аутентификации
        throw new Error('Authentication failed');
      }
    }
  }
}
