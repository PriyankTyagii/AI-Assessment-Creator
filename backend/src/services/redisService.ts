import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected');
});

const JOB_TTL = 60 * 60 * 2;   // 2 hours
const RESULT_TTL = 60 * 60;     // 1 hour

export async function setJobState(
  assignmentId: string,
  state: { status: string; percent: number; message: string }
): Promise<void> {
  await redisClient.setex(`job:${assignmentId}`, JOB_TTL, JSON.stringify(state));
}

export async function getJobState(assignmentId: string) {
  const raw = await redisClient.get(`job:${assignmentId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function cacheResult(assignmentId: string, result: unknown): Promise<void> {
  await redisClient.setex(`result:${assignmentId}`, RESULT_TTL, JSON.stringify(result));
}

export async function getCachedResult(assignmentId: string) {
  const raw = await redisClient.get(`result:${assignmentId}`);
  return raw ? JSON.parse(raw) : null;
}

export async function deleteCachedResult(assignmentId: string): Promise<void> {
  await redisClient.del(`result:${assignmentId}`);
}
