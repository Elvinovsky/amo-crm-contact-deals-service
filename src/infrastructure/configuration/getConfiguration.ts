export const getConfiguration = () => ({
  domain: 'shipagakerimov',
  amoCRMBaseUrl: 'https://shipagakerimov.amocrm.ru',
  client_id: '391e0a64-a71a-4ac3-8963-33e58043ca91', // ID интеграции
  client_secret:
    'FNQ64wwWzqp2pW3mrIFDtACWrrRuqLoBY1uM716PwjeJbnk3D4tNq0D9Ax7d1bmq', // Секретный ключ
  redirect_uri:
    'https://amo-crm-contact-deals-service.vercel.app/auth/callback', // ссылка для перенаправления
});

export type ConfigType = ReturnType<typeof getConfiguration>;
