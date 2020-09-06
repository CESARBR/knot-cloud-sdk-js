import HTTP from './network/HTTP';

export default class Client {
  constructor(config = {}) {
    this.http = new HTTP({
      protocol: 'https',
      hostname: 'api.knot.cloud',
      ...config,
    });
  }

  async createUser(email, password) {
    const body = { email, password };
    return this.http.post('/users', body);
  }

  async createToken(email, credential, type, duration) {
    const body = {
      email,
      password: type !== 'app' ? credential : '',
      token: type === 'app' ? credential : '',
      type,
      duration,
    };
    return this.http.post('/tokens', body);
  }
}
