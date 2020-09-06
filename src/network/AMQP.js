import amqp from 'amqp-connection-manager';

export default class AMQP {
  constructor(config) {
    const { protocol, hostname, port, username, password } = config;

    if (protocol !== 'amqp' && protocol !== 'amqps') {
      throw new Error("invalid protocol: must be either 'amqp' or 'amqps'");
    }

    this.config = {
      protocol,
      hostname,
      port,
      username,
      password,
    };
  }

  async start(onConnected) {
    this.connection = await amqp.connect(this.config);
    await new Promise(resolve => {
      this.connection.createChannel({
        json: true,
        setup: async channel => {
          this.channel = channel;
          await onConnected();
          resolve();
        },
      });
    });
  }

  async stop() {
    await this.channel.close();
    await this.connection.close();
  }

  async declareExchange(exchange, type, options = { durable: true }) {
    await this.channel.assertExchange(exchange, type, options);
  }

  async bindQueue(queue, exchange, routingKey) {
    await this.channel.assertQueue(queue, {
      exclusive: true,
      autoDelete: true,
    });
    await this.channel.bindQueue(queue, exchange, routingKey);
  }

  async publishMessage(exchange, type, routingKey, message, options) {
    await this.declareExchange(exchange, type);
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), options);
  }

  async subscribeTo(exchange, type, routingKey, queue, onMessage, options) {
    const callback = msg => onMessage(JSON.parse(msg.content.toString()), msg.properties);
    await this.declareExchange(exchange, type);
    await this.bindQueue(queue, exchange, routingKey);
    return this.channel.consume(queue, callback, options);
  }

  async unsubscribeConsumer(consumer) {
    return this.channel.cancel(consumer);
  }
}
