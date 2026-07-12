import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import analyticsRoutes from './routes/analytics.routes';
import driverRoutes from './routes/driver.routes';
import expenseRoutes from './routes/expense.routes';
import fuelRoutes from './routes/fuel.routes';
import maintenanceRoutes from './routes/maintenance.routes';
import tripRoutes from './routes/trip.routes';
import vehicleRoutes from './routes/vehicle.routes';
import errorMiddleware from './middleware/error.middleware';
import notFoundMiddleware from './middleware/notFound.middleware';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'TransitOps backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;