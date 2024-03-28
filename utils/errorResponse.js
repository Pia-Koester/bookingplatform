//extending the built-in Error class and enableling cosutm messages as well as status codes

class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

//export ErrorResponse to make it available in other files
module.exports = ErrorResponse;
