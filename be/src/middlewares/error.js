import { AppError } from '../utils/AppError.js';
import logger from '../utils/logger.js';

const notFound = (req, res, next) => {
    next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

const errorHandler = (err, req, res, next) => {
    logger.error(err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong',
    });
};

export { notFound, errorHandler };
