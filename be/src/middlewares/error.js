import { AppError } from "../utils/AppError.js";
import logger from "../utils/logger.js";

const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof AppError) {
    const response = {
      success: false,
      message: err.message,
    };

    // Nếu có errors array thì thêm vào response
    if (err.errors && Array.isArray(err.errors)) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};

export { notFound, errorHandler };
