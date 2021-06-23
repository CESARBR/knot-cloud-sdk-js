# knot-cloud-sdk-js

[![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js)

The `knot-cloud-sdk-js` is a client side library for Node.js and browser that aims to help developers to create solutions with the [KNoT Cloud](https://www.knot.cloud/).

This library exports the following SDKs:

- <strong>[AMQP SDK](https://github.com/CESARBR/knot-cloud-sdk-js-amqp) - [![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-amqp.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-amqp):</strong> to perform operations on things through the AMQP protocol.

- <strong>[Authenticator SDK](https://github.com/CESARBR/knot-cloud-sdk-js-authenticator) - [![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-authenticator.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-authenticator):</strong> to perform user management tasks such as authentication and password recovery.

- <strong>[Storage SDK](https://github.com/CESARBR/knot-cloud-sdk-js-storage) - [![npm version](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-storage.svg)](https://badge.fury.io/js/%40cesarbr%2Fknot-cloud-sdk-js-storage):</strong> to operate on data sent by devices.

# Quickstart

## Install

```console
npm install --save @cesarbr/knot-cloud-sdk-js
```

## AMQP SDK: Creating a new thing

```javascript
const { Client } = require("@cesarbr/knot-cloud-sdk-js");

const config = {
  amqp: {
    hostname: "broker.knot.cloud",
    port: 5672,
    username: "knot",
    password: "knot",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // this is not a valid token!
  },
  http: {
    hostname: "api.knot.cloud", // API Gateway address
    port: 80,
    protocol: "http",
  },
};

const thing = {
  id: "abcdef1234567890",
  name: "my-thing",
};

const main = async () => {
  try {
    await client.connect();
    await client.register(thing.id, thing.name);
    console.log("thing successfully created");
    await client.close();
  } catch (err) {
    console.error(err);
  }
};

main();
```

## Authenticator: Creating a new user

```javascript
const { Authenticator } = require("@cesarbr/knot-cloud-sdk-js");

const client = new Authenticator({
  protocol: "https",
  hostname: "api.knot.cloud",
});

async function main() {
  try {
    await client.createUser("user@provider.com", "123qwe!@#QWE");
  } catch (err) {
    if (err.response) {
      console.error(err.response.data.message);
      return;
    }
    console.error(err);
  }
}

main();
```

## Storage: Receiving user's data

```javascript
const { Storage } = require("@cesarbr/knot-cloud-sdk-js");

const client = new Storage({
  protocol: "https",
  hostname: "data.knot.cloud",
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // this is not a valid token!
});

async function main() {
  try {
    console.log(await client.listData());
  } catch (err) {
    if (err.response) {
      console.error(err.response.data.message);
      return;
    }
    console.error(err);
  }
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
