import { Queue } from 'bullmq';
import { GenerationJobData } from '../types/index.js';

function getRedisConnection() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const parsed = new URL(url);
  return { host: parsed.hostname, port: parseInt(parsed.port || '6379', 10) };
}

export const generationQueue = new Queue<GenerationJobData, void, string>('generation', {
  connection: getRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});
