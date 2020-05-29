import { AMQP, HTTP } from './network';
import * as api from './config/api';
import KNoTClient from './Client';
import Storage from './Storage';
import KNoTAuthenticator from './Authenticator';

class Client extends KNoTClient {
  constructor(config = {}) {
    if (!config.token) {
      throw new Error('access token not provided');
    }
    const amqp = new AMQP({
      protocol: 'amqp',
      hostname: 'broker.knot.cloud',
      port: 5672,
      username: 'knot',
      password: 'knot',
      ...config,
    });
    super(config.token, amqp, api);
  }
}

class Authenticator extends KNoTAuthenticator {
  constructor(config = {}) {
    const http = new HTTP({
      protocol: 'https',
      hostname: 'api.knot.cloud',
      ...config,
    });
    super(http);
  }
}

export { Client, Storage, Authenticator };
