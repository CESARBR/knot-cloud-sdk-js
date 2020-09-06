import AMQP from './network/AMQP';
import * as api from './config/api';
import KNoTClient from './Client';
import Storage from './Storage';
import Authenticator from './Authenticator';

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

export { Client, Storage, Authenticator };
