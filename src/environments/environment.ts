import { env } from './env.generated';

export const environment = {
  production: false,
  ...env,
  storeName: 'MusoHive',
};
