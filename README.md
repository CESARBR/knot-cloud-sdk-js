# knot-cloud-sdk-js
[![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js)

The `knot-cloud-sdk-js` is a client side library for Node.js and browser that aims to help developers to create solutions with the [KNoT Cloud](https://www.knot.cloud/).

This library exports the following SDKs:

- <strong>[WebSocket SDK](https://github.com/CESARBR/knot-cloud-websocket) - [![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-websocket.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-websocket):</strong> to connect with WebSocket protocol adapter and operate on devices.

- <strong>[Authenticator SDK](https://github.com/CESARBR/knot-cloud-sdk-js-authenticator) - [![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-authenticator.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-authenticator):</strong> to perform user management tasks such as authentication and password recovery.

- <strong>[Storage SDK](https://github.com/CESARBR/knot-cloud-sdk-js-storage) - [![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-storage.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-storage):</strong> to operate on data sent by devices.


# Quickstart

## Install

```console
npm install --save @cesarbr/knot-cloud-sdk-js
```

## Example: Register Device

```javascript
const { Client } = require('@cesarbr/knot-cloud-sdk-js');

const client = new Client({
  protocol: 'wss',
  hostname: 'ws.knot.cloud',
  port: 443,
  pathname: '/',
  id: '78159106-41ca-4022-95e8-2511695ce64c',
  token: 'd5265dbc4576a88f8654a8fc2c4d46a6d7b85574',
});

client.on('ready', () => {
  client.register({
    id: '6e5a681b2ae7be40',
    type: 'knot:thing',
    name: 'Door Lock',
  });
});
client.on('registered', (thing) => {
  console.log('Registered', thing);
  client.close();
});
client.connect();
```

## Example: List Device Data

```javascript
const { Storage } = require('@cesarbr/knot-cloud-sdk-js');

const client = new Storage({
  protocol: 'https',
  hostname: 'data.knot.cloud',
  id: 'b1a1bd58-c3ef-4cb5-82cd-3a2e0b38dd21',
  token: '3185a6c9d64915f6b468ee8043df4af5f08e1933',
});

async function main() {
  console.log(await client.listData())
}
main();

// [{
//   from: '188824f0-28c4-475b-ab36-2505402bebcb',
//   payload: {
//       sensorId: 2,
//       value: 234,
//   },
//   timestamp: '2019-03-18T12:48:05.569Z',
// },
// {
//   from: '188824f0-28c4-475b-ab36-2505402bebcb',
//   payload: {
//       sensorId: 1,
//       value: true,
//   },
//   timestamp: '2019-03-18T14:42:03.192Z',
// }]
```

## Example:

```javascript
const { Authenticator } = require('@cesarbr/knot-cloud-sdk-js');

const client = new Authenticator({
  protocol: 'https',
  hostname: 'auth.knot.cloud',
});

async function main() {
  try {
    console.log(await client.createUser('user@provider.com', '123qwe!@#QWE'));
  } catch (err) {
    if (err.response) {
      console.error(err.response.data.message);
      return;
    }
    console.error(err);
  }
}
main();

// { id: '863ad780-efd9-4158-b24a-026de3f1dffb'
//   token: '40ad864d503488eda9b629825876d46cb1356bdf' }
```
