import express, { Application } from 'express';
import cors from 'cors';
import { container } from './core/container/container';
import { IdentityRouter } from './modules/identity/identity.router';
import { globalErrorFilter } from './core/filters/globalError.filter';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Awilix scoped container — her istekte yeni scope
app.use((req, res, next) => {
  req.container = container.createScope();
  next();
});

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'ClubMS API is running' });
});

// Routes
app.use('/api/v1', IdentityRouter);

// Global error handler - en sonda olmalı
app.use(globalErrorFilter);

export { app };