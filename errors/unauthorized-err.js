class UnauthorizedError extends Error {
  constructor(message) {
    super();
    this.responseObject = { message };
    this.statusCode = 401;
  }
}

module.exports = UnauthorizedError;
