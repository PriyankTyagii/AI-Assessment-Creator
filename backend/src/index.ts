import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import mongoose from 'mongoose';
import assignmentRoutes from './routes/assignments.js';
import resultRoutes from './routes/results.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createWSSHandler } from './services/wsService.js';
import { startGenerationWorker } from './queues/workers/generationWorker.js';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/assignments', assignmentRoutes);
app.use('/api/results', resultRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });
createWSSHandler(wss);

async function bootstrap() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/assessment-creator';
  await mongoose.connect(mongoUri);
  console.log('[MongoDB] Connected to', mongoUri);

  startGenerationWorker();

  server.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[WS]     WebSocket ready on ws://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Fatal error:', err);
  process.exit(1);
});
