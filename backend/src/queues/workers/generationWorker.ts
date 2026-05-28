import { Worker, Job } from 'bullmq';
import { setJobState, cacheResult } from '../../services/redisService.js';
import { notifyRoom } from '../../services/wsService.js';
import { generateQuestionPaper } from '../../services/aiService.js';
import { Assignment } from '../../models/Assignment.js';
import { Result } from '../../models/Result.js';
import { GenerationJobData } from '../../types/index.js';

async function progress(
  assignmentId: string,
  percent: number,
  message: string
): Promise<void> {
  await setJobState(assignmentId, { status: 'processing', percent, message });
  notifyRoom(assignmentId, { type: 'progress', percent, message });
}

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;

  await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
  await progress(assignmentId, 10, 'Preparing prompt…');

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

  await progress(assignmentId, 30, 'Generating questions with AI…');
  const paper = await generateQuestionPaper(assignment);

  await progress(assignmentId, 80, 'Parsing and structuring output…');

  await progress(assignmentId, 95, 'Saving results…');
  const result = await Result.create({
    assignmentId: assignment._id,
    metadata: paper.metadata,
    sections: paper.sections,
  });

  await cacheResult(assignmentId, result.toObject());
  await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });

  await setJobState(assignmentId, { status: 'completed', percent: 100, message: 'Done' });
  notifyRoom(assignmentId, { type: 'completed', resultId: result._id.toString() });
}

function getRedisConnection() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const parsed = new URL(url);
  return { host: parsed.hostname, port: parseInt(parsed.port || '6379', 10) };
}

export function startGenerationWorker(): Worker<GenerationJobData> {
  const worker = new Worker<GenerationJobData>('generation', processJob, {
    connection: getRedisConnection(),
    concurrency: 3,
  });

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;
    console.error(`[Worker] Job failed for ${assignmentId}:`, err.message);
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      errorMessage: err.message,
    });
    await setJobState(assignmentId, { status: 'failed', percent: 0, message: err.message });
    notifyRoom(assignmentId, { type: 'failed', error: err.message });
  });

  console.log('[Worker] Generation worker started');
  return worker;
}
