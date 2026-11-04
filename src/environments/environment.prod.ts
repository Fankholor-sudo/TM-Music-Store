import { env } from './env.generated';

export const environment = {
  production: true,
  ...env,
  storeName: 'MusoHive',
};
