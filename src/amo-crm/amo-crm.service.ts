import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../configuration/getConfiguration';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AmoCRMService {
  private accessToken: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  private async getAccessToken() {
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
      grant_type: 'client_credentials',
      scope: 'contacts leads',
    };

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await this.httpService
      .post(authUrl, authData, config)
      .toPromise();

    if (response.data && response.data.access_token) {
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } else {
      throw new Error('Failed to obtain access token');
    }
  }

  private async authenticate() {
    if (!this.accessToken) {
      await this.getAccessToken();
    }

    this.httpService.axiosRef.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${this.accessToken}`;
  }

  // Шаг 1: Поиск контакта в AmoCRM по email и/или телефону
  private async findContact(email: string, phone: string) {
    await this.authenticate();

    const searchUrl = `${this.configService.get('amoCRMBaseUrl', {
      infer: true,
    })}/api/v4/contacts`;

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        query: `${email} ${phone}`,
      },
    };

    const response = await this.httpService.get(searchUrl, config).toPromise();

    if (
      response.data &&
      response.data._embedded &&
      response.data._embedded.contacts
    ) {
      const contacts = response.data._embedded.contacts;
      return contacts.length > 0 ? contacts[0] : null;
    }

    return null;
  }

  // Шаг 2: Обновление или создание контакта в AmoCRM
  private async updateOrCreateContact(
    name: string,
    email: string,
    phone: string,
  ) {
    const existingContact = await this.findContact(email, phone);

    if (existingContact) {
      // Контакт найден, обновляем его
      await this.updateContact(existingContact.id, name, email, phone);
    } else {
      // Контакт не найден, создаем новый
      const newContactId = await this.createContact(name, email, phone);
      // Шаг 3: Создание сделки
      await this.createDeal(newContactId);
    }
  }

  // Шаг 3: Создание контакта в AmoCRM
  private async createContact(name: string, email: string, phone: string) {
    await this.authenticate();

    const createContactUrl = `${this.configService.get('amoCRMBaseUrl', {
      infer: true,
    })}/api/v4/contacts`;

    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    const contactData = {
      name: name,
      custom_fields_values: [
        {
          field_id: 123, // Идентификатор поля для email, замените на реальный
          values: [{ value: email }],
        },
        {
          field_id: 456, // Идентификатор поля для телефона, замените на реальный
          values: [{ value: phone }],
        },
      ],
    };

    const response = await lastValueFrom(
      this.httpService.post(createContactUrl, contactData, config),
    );

    if (response.data && response.data.id) {
      return response.data.id;
    }

    throw new Error('Failed to create a new contact');
  }

  // Реализуйте другие методы, такие как updateContact, createDeal
  private async updateContact(
    contactId: number,
    name: string,
    email: string,
    phone: string,
  ) {
    // Реализуйте обновление контакта
  }

  private async createDeal(contactId: number) {
    // Реализуйте создание сделки
  }

  // Ваш метод для обработки запроса AmoCRM
  async processAmoCRMRequest(
    name: string,
    email: string,
    phone: string,
  ): Promise<string> {
    await this.updateOrCreateContact(name, email, phone);

    return 'Результат обработки запроса AmoCRM';
  }
}
