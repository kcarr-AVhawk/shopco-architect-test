const { v4: uuidv4 } = require('uuid');

function validateRequest(schema) {
  return (req, res, next) => {
    req.requestId = uuidv4();
    if (schema && schema.validate) {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(422).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message,
            retryable: false,
          },
        });
      }
    }
    next();
  };
}

module.exports = { validateRequest };
