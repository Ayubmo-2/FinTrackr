import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { globalLimiter } from './middleware/rateLimit.middleware';
import authRoutes from './routes/auth.routes';
import transactionRoutes from './routes/transactions.routes';
import budgetRoutes from './routes/budgets.routes';
import stripeRoutes from './routes/stripe.routes';
import statsRoutes from './routes/stats.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(globalLimiter);

// Stripe webhook needs raw body - must come before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Global error handler — must have 4 params for Express to recognise it
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
