class ForbiddenError extends Error {
  constructor(message) {
    super();
    this.responseObject = { message };
    this.statusCode = 403;
  }
}

module.exports = ForbiddenError;
