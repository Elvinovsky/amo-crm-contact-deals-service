import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AuthStorageService } from '../../auth/auth-storage.service';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration/getConfiguration';
import {
  CreateDataModel,
  CreateDealDataModel,
  UpdateDataModel,
} from '../../dto/data.models';

@Injectable()
export class AmoCrmAdapter {
  private readonly logger = new Logger(AmoCrmAdapter.name);

  // Инъекция зависимостей в конструкторе
  constructor(
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => AuthStorageService))
    private authService: AuthStorageService,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  // Получение токена
  async getAccessToken() {
    const authUrl = `${this.configService.get('amoCRMBaseUrl', {
      infer: true,
    })}/oauth2/access_token`;

    const authData = {
      client_id: this.configService.get('client_id', {
        infer: true,
      }),

      client_secret: this.configService.get('client_secret', {
        infer: true,
      }),

      grant_type: 'authorization_code',

      code: this.authService.getAuthCode(),

      redirect_uri: this.configService.get('redirect_uri', {
        infer: true,
      }),
    };

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Ожидание ответа от запроса токена
    const response = await firstValueFrom(
      this.httpService.post(authUrl, authData, config).pipe(
        catchError((error: AxiosError) => {
          this.logger.error(error.response?.data);
          throw 'An error happened during authentication!';
        }),
      ),
    );

    // Обработка успешного получения токена
    if (response.data && response.data.access_token) {
      const accessToken = response.data.access_token;
      const refreshToken = response.data.refresh_token;
      this.httpService.axiosRef.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${accessToken}`;

      return {
        accessToken,
        refreshToken,
      };
    } else {
      throw new Error('Failed to obtain access token');
    }
  }

  // Выполнение GET-запроса
  async makeGetRequest(url: string, config: AxiosRequestConfig): Promise<any> {
    await this.authService.authenticate();

    // Ожидание ответа от GET-запроса
    const result = await firstValueFrom(
      this.httpService.get(url, config).pipe(
        catchError((error: AxiosError) => {
          console.error('Error during API request:', error.response?.data);
          throw 'An error happened during API request!';
        }),
      ),
    );

    return result.data;
  }

  // Выполнение PATCH-запроса
  async makePathRequest(url: string, data: UpdateDataModel): Promise<any> {
    await this.authService.authenticate();

    // Ожидание ответа от PATCH-запроса
    const updateResult = await firstValueFrom(
      this.httpService.patch(url, data).pipe(
        catchError((error: AxiosError) => {
          console.error('Error during API request:', error.response?.data);
          throw 'An error happened during API request!';
        }),
      ),
    );

    return updateResult;
  }

  // Выполнение POST-запроса
  async makePostRequest(
    url: string,
    data: CreateDealDataModel | CreateDataModel,
    config?: AxiosRequestConfig,
  ): Promise<any> {
    await this.authService.authenticate();

    // Ожидание ответа от POST-запроса
    const createResult = firstValueFrom(
      this.httpService.post(url, data, config).pipe(
        catchError((error: AxiosError) => {
          console.error('Error during API request:', error.response?.data);
          throw 'An error happened during API request!';
        }),
      ),
    );
    return createResult;
  }
}
