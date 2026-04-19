import express, { Application } from 'express';
import cors from 'cors';
import { container } from './core/container/container';
import { IdentityRouter } from './modules/identity/identity.router';
import { ClubsRouter } from './modules/clubs/clubs.router';
import { EventsRouter } from './modules/events/events.router';
import { createAnalyticsRouter } from './modules/analytics/analytics.router';
import { AnalyticsController } from './modules/analytics/controllers/analytics.controller';
import { globalErrorFilter } from './core/filters/globalError.filter';
import { setupSwagger } from './swagger';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Awilix scoped container — her istekte yeni scope
app.use((req, res, next) => {
  req.container = container.createScope();
  next();
});

// Swagger Documentation
setupSwagger(app as any);

// Serve Postman collection
app.get('/api-docs/postman', (req, res) => {
  res.sendFile('api-docs/postman/ClubMS-API.postman_collection.json', { root: '.' });
});

app.get('/api-docs/postman/environment', (req, res) => {
  res.sendFile('api-docs/postman/ClubMS-Environment.postman_environment.json', { root: '.' });
});

// Healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'ClubMS API is running' });
});

// Routes
app.use('/api/v1', IdentityRouter);
app.use('/api/v1', ClubsRouter);
app.use('/api/v1', EventsRouter);

// Analytics Router - container'dan service'i al
const analyticsService = container.resolve('analyticsService') as any;
const analyticsController = new AnalyticsController(analyticsService);
const AnalyticsRouter = createAnalyticsRouter(analyticsController);
app.use('/api/v1/analytics', AnalyticsRouter);

// Global error handler - en sonda olmalı
app.use(globalErrorFilter);

export { app };