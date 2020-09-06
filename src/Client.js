import uniqid from 'uniqid';

class Client {
  constructor(token, amqp, api) {
    this.amqp = amqp;
    this.api = api;
    this.headers = { Authorization: token };
    this.userKey = uniqid();
    this.consumers = [];
  }

  async subscribeToResponse(resolve, reject, req, resp, message) {
    const { payload, options } = message;
    const queue = `${req.key}-${this.userKey}`;
    const consumerTag = `consumer-${queue}`;
    const handler = async ({ error, ...response }, properties) => {
      if (properties.correlationId === options.correlationId) {
        if (response.id === payload.id) {
          this.amqp
            .unsubscribeConsumer(consumerTag)
            // eslint-disable-next-line no-console
            .catch(err => console.log(err.message));
          if (error) {
            reject(Error(error));
          } else {
            resolve(response);
          }
        }
      }
    };
    await this.amqp.subscribeTo(resp.name, resp.type, resp.key, queue, handler, { consumerTag });
    try {
      await this.amqp.publishMessage(req.name, req.type, req.key, payload, options);
    } catch (err) {
      await this.amqp.unsubscribeConsumer(consumerTag);
      throw err;
    }
  }

  async sendRequest(req, resp, message) {
    return new Promise((resolve, reject) =>
      this.subscribeToResponse(resolve, reject, req, resp, message).catch(err => reject(err))
    );
  }

  async connect() {
    return this.amqp.start(async () => this.registerConsumers());
  }

  async close() {
    await this.clearConsumers();
    return this.amqp.stop();
  }

  async register(id, name) {
    const msg = {
      payload: { id, name },
      options: { headers: this.headers },
    };
    const req = this.api.getDefinition(this.api.REGISTER_DEVICE);
    const resp = this.api.getResponseDefinition(this.api.REGISTER_DEVICE);
    return this.sendRequest(req, resp, msg);
  }

  async unregister(id) {
    const msg = {
      payload: { id },
      options: { headers: this.headers },
    };
    const req = this.api.getDefinition(this.api.UNREGISTER_DEVICE);
    const resp = this.api.getResponseDefinition(this.api.UNREGISTER_DEVICE);
    return this.sendRequest(req, resp, msg);
  }

  async authDevice(id) {
    const msg = {
      payload: { id },
      options: {
        headers: this.headers,
        replyTo: `auth-${this.userKey}`,
        correlationId: uniqid.time(),
      },
    };
    const req = this.api.getDefinition(this.api.AUTH_DEVICE);
    const resp = { ...req, key: msg.options.replyTo };
    return this.sendRequest(req, resp, msg);
  }

  async getDevices() {
    const msg = {
      payload: {},
      options: {
        headers: this.headers,
        replyTo: `list-${this.userKey}`,
        correlationId: uniqid.time(),
      },
    };
    const req = this.api.getDefinition(this.api.LIST_DEVICES);
    const resp = { ...req, key: msg.options.replyTo };
    return this.sendRequest(req, resp, msg);
  }

  async updateSchema(id, schemaList) {
    const msg = {
      payload: { id, schema: schemaList },
      options: { headers: this.headers },
    };
    const req = this.api.getDefinition(this.api.UPDATE_SCHEMA);
    const resp = this.api.getResponseDefinition(this.api.UPDATE_SCHEMA);
    return this.sendRequest(req, resp, msg);
  }

  async publishData(id, dataList) {
    const payload = { id, data: dataList };
    const req = this.api.getDefinition(this.api.DATA_SENT_EXCHANGE);
    return this.amqp.publishMessage(req.name, req.type, req.key, payload, {
      headers: this.headers,
    });
  }

  async getData(id, sensorIds) {
    const payload = { id, sensorIds };
    const req = this.api.getDefinition(this.api.REQUEST_DATA);
    return this.amqp.publishMessage(req.name, req.type, req.key, payload, {
      headers: this.headers,
    });
  }

  async setData(id, dataList) {
    const payload = { id, data: dataList };
    const req = this.api.getDefinition(this.api.UPDATE_DATA);
    return this.amqp.publishMessage(req.name, req.type, req.key, payload, {
      headers: this.headers,
    });
  }

  async once(event, callback) {
    const queue = `${event}-${this.userKey}`;
    const consumerTag = uniqid.time(`${queue}-`);
    return this.on(
      event,
      async msg => {
        this.amqp.unsubscribeConsumer(consumerTag);
        callback(msg);
      },
      { consumerTag }
    );
  }

  async on(event, callback, options = {}) {
    const { consumerTag = uniqid() } = options;
    const queue = `${event}-${this.userKey}-${consumerTag}`;

    if (!this.isValidEvent(event)) {
      throw new Error('Event not recognized!');
    }

    const exchange =
      event === 'data'
        ? {
            name: this.api.DATA_PUBLISHED_EXCHANGE,
            type: this.api.DATA_PUBLISHED_EXCHANGE_TYPE,
          }
        : {
            name: this.api.DEVICE_EXCHANGE,
            type: this.api.DEVICE_EXCHANGE_TYPE,
          };

    if (!options.consumerTag) {
      this.consumers.push({
        topic: event,
        exchange,
        handler: callback,
        tag: consumerTag,
      });
    }

    return this.amqp.subscribeTo(exchange.name, exchange.type, event, queue, callback, {
      ...options,
      consumerTag,
    });
  }

  async unsubscribe(event) {
    await Promise.all(
      this.consumers
        .filter(({ topic }) => topic === event)
        .map(({ tag }) => this.amqp.unsubscribeConsumer(tag))
    );
    this.consumers = this.consumers.filter(({ topic }) => topic !== event);
  }

  isValidEvent(event) {
    // Regex to check if event follows the pattern device.<thingId>.data.(request|update)
    const dataRegex = /device\.([a-f0-9]{16})\.data\.(request|update)/;
    return dataRegex.test(event) || event === 'data';
  }

  async registerConsumers() {
    await Promise.all(
      this.consumers.map(({ topic, exchange, handler, tag }) =>
        this.amqp.subscribeTo(
          exchange.name,
          exchange.type,
          topic,
          `${topic}-${this.userKey}-${tag}`,
          handler,
          { consumerTag: tag }
        )
      )
    );
  }

  async clearConsumers() {
    await Promise.all(this.consumers.map(({ tag }) => this.amqp.unsubscribeConsumer(tag)));
    this.consumers = [];
  }
}

export default Client;
