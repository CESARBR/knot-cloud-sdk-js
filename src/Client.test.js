import AMQP, * as amqpMocks from './network/AMQP';
import * as api from './config/api';
import Client from './Client';

jest.mock('./network/AMQP');

const mockToken = 'my-authorization-token';
const mockThing = {
  id: 'abcdef1234568790',
  name: 'my-device',
  schema: [
    {
      sensorId: 0,
      typeId: 65521,
      valueType: 3,
      unit: 0,
      name: 'bool-sensor',
    },
  ],
};
const mockData = [
  {
    sensorId: 0,
    value: true,
  },
];

const invalidEventErr = 'Event not recognized!';

const errors = {
  // Client methods
  register: 'error registering thing',
  unregister: 'error unregistering thing',
  authDevice: 'error authenticating thing',
  getDevices: 'error listing registered things',
  updateSchema: 'error updating thing schema',
  // AMQP methods
  start: 'error while starting AMQP connection',
  stop: 'error while stopping AMQP connection',
  publishMessage: 'error publishing message on broker',
  subscribeTo: 'error subscribing consumer on queue',
  unsubscribeConsumer: 'error unsubscribing consumer',
};

const registerUseCases = [
  {
    testName: 'should register when there is no error at all',
    amqpOptions: {
      responseMessage: { id: mockThing.id },
    },
  },
  {
    testName: 'should fail to register when response has some error',
    amqpOptions: {
      responseMessage: { id: mockThing.id, error: errors.register },
    },
    expectedErr: errors.register,
  },
  {
    testName: 'should fail to register when unable to publish request message',
    amqpOptions: {
      publishErr: errors.publishMessage,
    },
    expectedErr: errors.publishMessage,
  },
  {
    testName: 'should fail to register when unable to subscribe on response event',
    amqpOptions: {
      subscribeErr: errors.subscribeTo,
    },
    expectedErr: errors.subscribeTo,
  },
  {
    testName: 'should register even when unable to unsubscribe consumer',
    amqpOptions: {
      responseMessage: { id: mockThing.id },
      unsubscribeErr: errors.unsubscribeConsumer,
    },
  },
];

const unregisterUseCases = [
  {
    testName: 'should unregister thing when there is no error at all',
    amqpOptions: {
      responseMessage: { id: mockThing.id },
    },
  },
  {
    testName: 'should fail to unregister when response has some error',
    amqpOptions: {
      responseMessage: { id: mockThing.id, error: errors.unregister },
    },
    expectedErr: errors.unregister,
  },
];

const authDeviceUseCases = [
  {
    testName: 'should authenticate thing when there is no error at all',
    amqpOptions: {
      responseMessage: { id: mockThing.id },
    },
  },
  {
    testName: 'should fail to authenticate when response has some error',
    amqpOptions: {
      responseMessage: { id: mockThing.id, error: errors.authDevice },
    },
    expectedErr: errors.authDevice,
  },
];

const getDevicesUseCases = [
  {
    testName: 'should list registered thing when there is no error at all',
    amqpOptions: {
      responseMessage: { devices: [mockThing] },
    },
  },
  {
    testName: 'should fail to list things when response has some error',
    amqpOptions: {
      responseMessage: { devices: [], error: errors.getDevices },
    },
    expectedErr: errors.getDevices,
  },
];

const updateSchemaUseCases = [
  {
    testName: "should update thing's schema when there is no error at all",
    amqpOptions: {
      responseMessage: { id: mockThing.id, schema: mockThing.schema },
    },
  },
  {
    testName: "should fail to update thing's schema when response has some error",
    amqpOptions: {
      responseMessage: {
        id: mockThing.id,
        schema: null,
        error: errors.updateSchema,
      },
    },
    expectedErr: errors.updateSchema,
  },
];

const publishDataUseCases = [
  {
    testName: 'should publish data when there is no error at all',
  },
  {
    testName: 'should fail to publish data when unable to publish a message',
    amqpOptions: {
      publishErr: errors.publishMessage,
    },
    expectedErr: errors.publishMessage,
  },
];

const getDataUseCases = [
  {
    testName: 'should request for data when there is no error at all',
  },
  {
    testName: 'should fail to request for data when unable to publish the request message',
    amqpOptions: {
      publishErr: errors.publishMessage,
    },
    expectedErr: errors.publishMessage,
  },
];

const setDataUseCases = [
  {
    testName: "should update thing's data when there is no error at all",
  },
  {
    testName: "should fail to update thing's data when unable to publish the update message",
    amqpOptions: {
      publishErr: errors.publishMessage,
    },
    expectedErr: errors.publishMessage,
  },
];

const onceUseCases = [
  {
    testName: 'should listen to event when there is no error at all',
    event: 'data',
    callback: jest.fn(),
  },
  {
    testName: 'should fail to register listener when the event is invalid',
    event: 'invalid-event',
    expectedErr: invalidEventErr,
  },
];

const onUseCases = [
  {
    testName: 'should listen to event when there is no error at all',
    event: 'data',
    callback: jest.fn(),
  },
  {
    testName: 'should fail to register listener when unable to subscribe on events',
    event: 'data',
    amqpOptions: {
      subscribeErr: errors.subscribeTo,
    },
    expectedErr: errors.subscribeTo,
  },
  {
    testName: 'should fail to register listener when the event is invalid',
    event: 'invalid-event',
    expectedErr: invalidEventErr,
  },
];

describe('Client', () => {
  beforeEach(() => {
    amqpMocks.mockStart.mockClear();
    amqpMocks.mockStop.mockClear();
    amqpMocks.mockPublishMessage.mockClear();
    amqpMocks.mockSubscribeTo.mockClear();
    amqpMocks.mockUnsubscribeConsumer.mockClear();
  });

  registerUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`register: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let response;
      let error;

      try {
        response = await client.register(mockThing.id, mockThing.name);
      } catch (err) {
        error = err.message;
      }

      if (response) {
        expect(response).toMatchObject(amqpOptions.responseMessage);
      }
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  unregisterUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`unregister: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let response;
      let error;

      try {
        response = await client.unregister(mockThing.id);
      } catch (err) {
        error = err.message;
      }

      if (response) {
        expect(response).toMatchObject(amqpOptions.responseMessage);
      }
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  authDeviceUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`authDevice: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let response;
      let error;

      try {
        response = await client.authDevice(mockThing.id);
      } catch (err) {
        error = err.message;
      }

      if (response) {
        expect(response).toMatchObject(amqpOptions.responseMessage);
      }
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  getDevicesUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`getDevices: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let response;
      let error;

      try {
        response = await client.getDevices();
      } catch (err) {
        error = err.message;
      }

      if (response) {
        expect(response).toMatchObject(amqpOptions.responseMessage);
      }
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  updateSchemaUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`updateSchema: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let response;
      let error;

      try {
        response = await client.updateSchema(mockThing.id, mockThing.schema);
      } catch (err) {
        error = err.message;
      }

      if (response) {
        expect(response).toMatchObject(amqpOptions.responseMessage);
      }
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  publishDataUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`publishData: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let error;

      try {
        await client.publishData(mockThing.id, mockData);
      } catch (err) {
        error = err.message;
      }

      expect(amqpMocks.mockPublishMessage).toHaveBeenCalled();
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  getDataUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`getData: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let error;

      try {
        const sensors = mockData.map(data => data.sensorId);
        await client.getData(mockThing.id, sensors);
      } catch (err) {
        error = err.message;
      }

      expect(amqpMocks.mockPublishMessage).toHaveBeenCalled();
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  setDataUseCases.forEach(useCase => {
    const { testName, amqpOptions, expectedErr } = useCase;

    test(`setData: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let error;

      try {
        await client.setData(mockThing.id, mockData);
      } catch (err) {
        error = err.message;
      }

      expect(amqpMocks.mockPublishMessage).toHaveBeenCalled();
      if (error) {
        expect(error).toBe(expectedErr);
      }
    });
  });

  onceUseCases.forEach(useCase => {
    const { testName, event, callback, amqpOptions, expectedErr } = useCase;

    test(`once: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let error;

      try {
        await client.once(event, callback);
        amqp.executeEvent();
      } catch (err) {
        error = err.message;
      }

      if (error) {
        expect(error).toBe(expectedErr);
      } else {
        expect(callback).toHaveBeenCalled();
      }
    });
  });

  onUseCases.forEach(useCase => {
    const { testName, event, callback, amqpOptions, expectedErr } = useCase;

    test(`on: ${testName}`, async () => {
      const amqp = new AMQP(amqpOptions);
      const client = new Client(mockToken, amqp, api);
      let error;

      try {
        await client.on(event, callback);
        amqp.executeEvent();
      } catch (err) {
        error = err.message;
      }

      if (error) {
        expect(error).toBe(expectedErr);
      } else {
        expect(callback).toHaveBeenCalled();
      }
    });
  });
});
