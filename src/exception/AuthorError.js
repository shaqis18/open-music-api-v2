const ClientError = require('./ClientError');

class AuthorError extends ClientError {
  constructor(message, statusCode = 403) {
    super(message, statusCode);
    this.name = 'AuthorError';
  }
}
module.exports = AuthorError;