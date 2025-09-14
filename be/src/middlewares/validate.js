import Joi from 'joi';
import { BadRequestError } from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  // Define what to validate against the schema
  const toValidate = {};
  if (schema.params) {
    toValidate.params = req.params;
  }
  if (schema.query) {
    toValidate.query = req.query;
  }
  if (schema.body) {
    toValidate.body = req.body;
  }

  // Compile and validate
  const { error, value } = Joi.compile(schema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(toValidate);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    return next(new BadRequestError(errorMessage));
  }

  // Assign validated values to the request object
  // This mimics the original middleware's behavior of polluting the req object,
  // but does so for params, query, and body, avoiding the read-only `req.query` error.
  Object.assign(req, value.params, value.query, value.body);

  return next();
};

export { validate };
