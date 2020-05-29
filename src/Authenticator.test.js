import HTTP, * as httpMocks from './network/HTTP';
import Authenticator from './Authenticator';

jest.mock('./network/HTTP');

const email = 'knot@knot.com';
const password = '123qwe123qwe';
const userToken = 'user-access-token';

describe('SDK Authenticator', () => {
  beforeEach(() => {
    httpMocks.mockPost.mockClear();
  });

  test('should create a new user when connection is ok', async () => {
    const http = new HTTP();
    const auth = new Authenticator(http);
    await auth.createUser(email, password);
    expect(httpMocks.mockPost).toHaveBeenCalled();
  });

  test('should fail to create a new user when something goes wrong', async () => {
    const postErr = 'error in post request';
    const http = new HTTP({ postErr });
    const auth = new Authenticator(http);
    let error;
    try {
      await auth.createUser(email, password);
    } catch (err) {
      error = err.message;
    }
    expect(error).toBe(postErr);
  });

  test('should create a user token when connection is ok', async () => {
    const token = 'authorization-token';
    const http = new HTTP({ postRet: { token } });
    const auth = new Authenticator(http);
    const response = await auth.createToken(email, password, 'user');
    expect(response).toMatchObject({ token });
    expect(httpMocks.mockPost).toHaveBeenCalled();
  });

  test('should fail to create a user token when something goes wrong', async () => {
    const postErr = 'error in post request';
    const http = new HTTP({ postErr });
    const auth = new Authenticator(http);
    let error;
    try {
      await auth.createToken(email, password, 'user');
    } catch (err) {
      error = err.message;
    }
    expect(error).toBe(postErr);
  });

  test('should create a app token when connection is ok', async () => {
    const token = 'authorization-token';
    const http = new HTTP({ postRet: { token } });
    const auth = new Authenticator(http);
    const response = await auth.createToken(email, userToken, 'app', 0);
    expect(response).toMatchObject({ token });
    expect(httpMocks.mockPost).toHaveBeenCalled();
  });

  test('should fail to create a app token when something goes wrong', async () => {
    const postErr = 'error in post request';
    const http = new HTTP({ postErr });
    const auth = new Authenticator(http);
    let error;
    try {
      await auth.createToken(email, userToken, 'app', 0);
    } catch (err) {
      error = err.message;
    }
    expect(error).toBe(postErr);
  });

  test('should fail to create a token when type parameter is invalid', async () => {
    const postErr = 'error in post request';
    const http = new HTTP({ postErr });
    const auth = new Authenticator(http);
    let error;
    try {
      await auth.createToken(email, password, 'invalid-type');
    } catch (err) {
      error = err.message;
    }
    expect(error).toBe(postErr);
  });
});
