import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.route.js';
import userRoutes from './src/routes/user.route.js'; 
import logger from './src/utils/logger.js';
import { notFound, errorHandler } from './src/middlewares/error.js';
import config from './src/config/index.js';
import productRoutes from "./src/routes/product.route.js";

dotenv.config();
const app = express();

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev', { stream: logger.stream }));
}

// CORS configuration
app.use(
    cors({
        origin: ["http://localhost:3001","http://localhost:3000","http://localhost:3002", "http://localhost:3003"],
        credentials: true,
        methods: ['GET', 'POST','PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }),
);
app.use(express.json());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes); // Thêm dòng này

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
