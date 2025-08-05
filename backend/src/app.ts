import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import emailAnalysisRoutes from './routes/email-analysis.routes';
import rewordRoutes from './routes/reword.routes';
import composeRoutes from './routes/compose.routes';
import authRoutes from './routes/auth.routes';

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Simple request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/analyze-email', emailAnalysisRoutes);
app.use('/api/reword', rewordRoutes);
app.use('/api/compose', composeRoutes);
app.use('/auth', authRoutes);

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check called');
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
  console.log('404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
