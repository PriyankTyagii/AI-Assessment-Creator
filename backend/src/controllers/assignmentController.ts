import { Request, Response, NextFunction } from 'express';
import { Assignment } from '../models/Assignment.js';
import { generationQueue } from '../queues/generationQueue.js';
import { deleteCachedResult } from '../services/redisService.js';

export async function createAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { questionTypeConfigs, fileContent, ...rest } = req.body;

    const numberOfQuestions = questionTypeConfigs.reduce(
      (sum: number, c: { count: number }) => sum + c.count, 0
    );
    const totalMarks = questionTypeConfigs.reduce(
      (sum: number, c: { count: number; marksPerQuestion: number }) =>
        sum + c.count * c.marksPerQuestion,
      0
    );

    const assignment = await Assignment.create({
      ...rest,
      questionTypeConfigs,
      numberOfQuestions,
      totalMarks,
      fileContent,
      status: 'pending',
    });

    const job = await generationQueue.add('generate', { assignmentId: assignment._id.toString() });
    await assignment.updateOne({ jobId: job.id });

    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function listAssignments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Assignment.countDocuments(),
    ]);

    res.json({ success: true, data: assignments, pagination: { page, limit, total } });
  } catch (err) {
    next(err);
  }
}

export async function getAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }
    res.json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
}

export async function deleteAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }
    await deleteCachedResult(req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function regenerateAssignment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    await deleteCachedResult(assignment._id.toString());
    await assignment.updateOne({ status: 'pending', errorMessage: undefined });
    const job = await generationQueue.add('generate', { assignmentId: assignment._id.toString() });
    await assignment.updateOne({ jobId: job.id });

    res.json({ success: true, message: 'Regeneration started' });
  } catch (err) {
    next(err);
  }
}
