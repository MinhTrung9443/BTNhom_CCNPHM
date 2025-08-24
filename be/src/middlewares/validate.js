import { BadRequestError } from '../utils/AppError.js';

const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details?.map((detail) => detail.message).join(', ');
    throw new BadRequestError(errorMessage);
  }
  Object.assign(req, value);
  return next();
};

export { validate };
