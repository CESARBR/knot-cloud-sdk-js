export const mockGet = jest.fn();
export const mockPost = jest.fn();

export default jest.fn().mockImplementation((options = {}) => {
  if (options.getErr) {
    mockGet.mockRejectedValue(Error(options.getErr));
  } else {
    mockGet.mockResolvedValue(options.getRet);
  }

  if (options.postErr) {
    mockPost.mockRejectedValue(Error(options.postErr));
  } else {
    mockPost.mockResolvedValue(options.postRet);
  }

  return {
    get: mockGet,
    post: mockPost,
  };
});
