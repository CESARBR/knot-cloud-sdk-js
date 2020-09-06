import HTTP from './network/HTTP';

export default class Client {
  constructor(config = {}) {
    if (!config.token) {
      throw new Error('access token not provided');
    }

    this.http = new HTTP({
      protocol: 'https',
      hostname: 'storage.knot.cloud',
      ...config,
    });
  }

  async listData(query) {
    return this.http.get('/data', query);
  }

  async listDataByDevice(thingId, query) {
    return this.http.get(`/data/${thingId}`, query);
  }

  async listDataBySensor(thingId, sensorId, query) {
    return this.http.get(`/data/${thingId}/sensor/${sensorId}`, query);
  }
}
