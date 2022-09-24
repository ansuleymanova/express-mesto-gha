class NotFoundError extends Error {
  constructor(message) {
    super();
    this.responseObject = { message };
    this.statusCode = 404;
  }
}

module.exports = NotFoundError;
