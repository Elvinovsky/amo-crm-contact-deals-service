import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../infrastructure/configuration/getConfiguration';
import { AmoCrmAdapter } from '../infrastructure/adapters/amo-crm-adapter';
import {
  CreateDataModel,
  CreateDealDataModel,
  UpdateDataModel,
} from '../dto/data.models';
@Injectable()
export class AmoCRMService {
  private readonly logger = new Logger(AmoCRMService.name);
  constructor(
    private adapter: AmoCrmAdapter,
    private readonly configService: ConfigService<ConfigType>,
  ) {}

  async processAmoCRMRequest(
    name: string,
    email: string,
    phone: string,
  ): Promise<string> {
    try {
      const result = await this.updateOrCreateContact(name, email, phone);
      return result;
    } catch (error) {
      this.logger.error(error);
      return 'Произошла ошибка при обработке запроса AmoCRM';
    }
  }

  // Поиск контакта в AmoCRM по email и телефону
  private async findContact(email: string, phone: string) {
    const searchUrl = `${this.configService.get('amoCRMBaseUrl', {
      infer: true,
    })}/api/v4/contacts`;

    const configEmail: AxiosRequestConfig = {
      params: {
        query: `${email}`,
      },
    };

    const configPhone: AxiosRequestConfig = {
      params: {
        query: `${phone}`,
      },
    };

    const findPhoneResponse = await this.adapter.makeGetRequest(
      searchUrl,
      configPhone,
    );
    const findEmailResponse = await this.adapter.makeGetRequest(
      searchUrl,
      configEmail,
    );

    const findPhoneContact = findPhoneResponse?._embedded?.contacts?.[0];
    const findEmailContact = findEmailResponse?._embedded?.contacts?.[0];

    if (findPhoneContact && findEmailContact) {
      // Если найдены контакты по обоим запросам
      if (findPhoneContact.id === findEmailContact.id) {
        return findPhoneContact;
      } else {
        // контакты по телефону и email различаются
        throw new Error('Контакты по телефону и email различаются');
      }
    }

    return findPhoneContact || findEmailContact || null;
  }

  // Обновление или создание контакта в AmoCRM
  private async updateOrCreateContact(
    name: string,
    email: string,
    phone: string,
  ) {
    const existingContact = await this.findContact(email, phone);

    // Битые данные (телефон или майл уже существует у другого пользователя)
    if (existingContact === false) {
      return 'телефон или емайл уже присвоен другому пользователю';
    } else if (existingContact) {
      // Контакт найден, обновляем его
      await this.updateContact(existingContact.id, name, email, phone);
    } else {
      // Контакт не найден, создаем новый
      const newContactId = await this.createContact(name, email, phone);
      // Шаг 3: Создание сделки
      await this.createDeal(newContactId);
      return `контакт ${newContactId} создан`;
    }
  }

  // Создание контакта
  private async createContact(name: string, email: string, phone: string) {
    const createContactUrl = `${this.configService.get('amoCRMBaseUrl', {
      infer: true,
    })}/api/v4/contacts`;

    const contactData: CreateDataModel = [
      {
        name: name,
        custom_fields_values: [
          {
            field_name: 'Телефон',
            field_code: 'PHONE',
            field_type: 'multitext',
            values: [
              {
                value: phone,
              },
            ],
          },
          {
            field_name: 'EMAIL',
            field_code: 'EMAIL',
            field_type: 'multitext',
            values: [
              {
                value: email,
              },
            ],
          },
        ],
      },
    ];

    const createResult = await this.adapter.makePostRequest(
      createContactUrl,
      contactData,
    );

    if (createResult.data?._embedded?.contacts[0].id) {
      return createResult.data?._embedded?.contacts[0].id;
    }

    throw new Error('Failed to create a new contact');
  }

  // Создание сделки
  private async createDeal(contactId: number) {
    const createDealUrl = `${this.configService.get('amoCRMBaseUrl', {
      infer: true,
    })}/api/v4/leads`;

    const dealData: CreateDealDataModel = [
      {
        name: 'сделка',
        _embedded: {
          contacts: [
            {
              id: contactId,
            },
          ],
        },
      },
    ];

    const createResult = await this.adapter.makePostRequest(
      createDealUrl,
      dealData,
    );

    if (createResult?.data?._embedded?.leads[0]?.id) {
      return createResult.data._embedded.leads[0].id;
    }

    throw new Error('Failed to create a new deal');
  }

  // Обновление контакта
  private async updateContact(
    contactId: number,
    name: string,
    email: string,
    phone: string,
  ) {
    const updateContactUrl = `${this.configService.get('amoCRMBaseUrl', {
      infer: true,
    })}/api/v4/contacts/${contactId}`;

    const contactData: UpdateDataModel = {
      name: name,
      custom_fields_values: [
        {
          field_name: 'Телефон',
          field_code: 'PHONE',
          field_type: 'multitext',
          values: [
            {
              value: phone,
            },
          ],
        },
        {
          field_name: 'EMAIL',
          field_code: 'EMAIL',
          field_type: 'multitext',
          values: [
            {
              value: email,
            },
          ],
        },
      ],
    };

    const updateResult = await this.adapter.makePathRequest(
      updateContactUrl,
      contactData,
    );

    if (updateResult?.data) {
      return ` контакт ${updateResult.data?.id} обновлен`;
    }

    throw new Error('Failed to update the contact');
  }
}
