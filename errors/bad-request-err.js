class BadRequestError extends Error {
  constructor(message) {
    super();
    this.responseObject = { message };
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
