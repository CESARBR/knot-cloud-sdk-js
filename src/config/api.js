// API reference: https://github.com/CESARBR/knot-fog-connector/blob/master/docs/api/amqp.md

// exchange definitions:
export const DATA_SENT_EXCHANGE = 'data.sent';
export const DATA_SENT_EXCHANGE_TYPE = 'fanout';
export const DATA_PUBLISHED_EXCHANGE = 'data.published';
export const DATA_PUBLISHED_EXCHANGE_TYPE = 'fanout';
export const DEVICE_EXCHANGE = 'device';
export const DEVICE_EXCHANGE_TYPE = 'direct';

// routing keys definitions:
export const REQUEST_DATA = 'data.request';
export const UPDATE_DATA = 'data.update';
export const REGISTER_DEVICE = 'device.register';
export const REGISTER_DEVICE_RESPONSE = 'device.registered';
export const UNREGISTER_DEVICE = 'device.unregister';
export const UNREGISTER_DEVICE_RESPONSE = 'device.unregistered';
export const UPDATE_SCHEMA = 'device.schema.sent';
export const UPDATE_SCHEMA_RESPONSE = 'device.schema.updated';
export const AUTH_DEVICE = 'device.auth';
export const LIST_DEVICES = 'device.list';

const exchangeDefinitions = {
  [DEVICE_EXCHANGE]: {
    type: DEVICE_EXCHANGE_TYPE,
    keys: [
      AUTH_DEVICE,
      LIST_DEVICES,
      REGISTER_DEVICE,
      REGISTER_DEVICE_RESPONSE,
      UNREGISTER_DEVICE,
      UNREGISTER_DEVICE_RESPONSE,
      UPDATE_SCHEMA,
      UPDATE_SCHEMA_RESPONSE,
      REQUEST_DATA,
      UPDATE_DATA,
    ],
  },
  [DATA_SENT_EXCHANGE]: {
    type: DATA_SENT_EXCHANGE_TYPE,
    keys: [],
  },
  [DATA_PUBLISHED_EXCHANGE]: {
    type: DATA_PUBLISHED_EXCHANGE_TYPE,
    keys: [],
  },
};

const responseKeys = {
  [REGISTER_DEVICE]: REGISTER_DEVICE_RESPONSE,
  [UNREGISTER_DEVICE]: UNREGISTER_DEVICE_RESPONSE,
  [UPDATE_SCHEMA]: UPDATE_SCHEMA_RESPONSE,
};

const getExchangeByKey = key => {
  const [exchange] = Object.entries(exchangeDefinitions).find(([, val]) =>
    val.keys.includes(key)
  ) || [null];
  return exchange;
};

// This method returns a object containing the exchange name, type and routing key of the associated operation
export const getDefinition = id => {
  const name = getExchangeByKey(id) || id;
  const { type } = exchangeDefinitions[name];
  const key = id === name ? '' : id;
  return { name, type, key };
};

// This method returns the object definition of the associated operation response
export const getResponseDefinition = key => {
  return getDefinition(responseKeys[key]);
};
