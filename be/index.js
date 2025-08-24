import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.route.js';
import logger from './src/utils/logger.js';
import { notFound, errorHandler } from './src/middlewares/error.js';

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev', { stream: logger.stream }));
}

app.use(express.json());
connectDB();

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
