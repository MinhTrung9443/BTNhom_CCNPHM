import Joi from 'joi';
import { BadRequestError } from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  let effectiveSchema;
  const contentType = req.headers['content-type'];

  // If the schema is structured with json/formData keys, pick the right one.
  if (schema.json && schema.formData) {
    if (contentType && contentType.includes('multipart/form-data')) {
      effectiveSchema = schema.formData;
    } else {
      effectiveSchema = schema.json;
    }
  } else {
    // Fallback to the original behavior for non-structured schemas
    effectiveSchema = schema;
  }

  const toValidate = {};
  if (effectiveSchema.params) {
    toValidate.params = req.params;
  }
  if (effectiveSchema.query) {
    toValidate.query = req.query;
  }
  if (effectiveSchema.body) {
    toValidate.body = req.body;
  }

  const { error, value } = Joi.compile(effectiveSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false })
    .validate(toValidate);

  if (error) {
    const errorMessage = error.details
      .map((details) => details.message)
      .join(', ');
    return next(new BadRequestError(errorMessage));
  }
  
  // Re-assign the validated properties back to the request object
  if (value.params) {
    Object.assign(req.params, value.params);
  }
  if (value.query) {
    Object.assign(req.query, value.query);
  }
  if (value.body) {
    // For FormData, we need to parse stringified fields
    if (contentType && contentType.includes('multipart/form-data')) {
      if (value.body.tags && typeof value.body.tags === 'string') {
        try {
          value.body.tags = JSON.parse(value.body.tags);
        } catch (e) {
          return next(new BadRequestError('Invalid JSON format for tags.'));
        }
      }
    }
    Object.assign(req.body, value.body);
  }

  return next();
};

export { validate };
