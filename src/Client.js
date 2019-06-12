import KNoTCloudWebsocket from '@cesarbr/knot-cloud-websocket';

class Client {}

const clientHandler = {
  construct(target, args) {
    const properties = args[0];
    if (properties.protocol !== 'ws' && properties.protocol !== 'wss') {
      throw new Error('Unsupported client protocol');
    }

    return new KNoTCloudWebsocket(properties);
  },
};

export default new Proxy(Client, clientHandler);
