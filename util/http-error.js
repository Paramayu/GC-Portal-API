class HTTPError extends Error {
  constructor(message, statusCode, error = null) {
    super(message);
    this.status = statusCode;
    this.err = error;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = HTTPError;
