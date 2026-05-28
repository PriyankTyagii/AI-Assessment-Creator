import { Request, Response, NextFunction } from 'express';
import { Result } from '../models/Result.js';
import { getCachedResult, cacheResult } from '../services/redisService.js';

export async function getResult(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { assignmentId } = req.params;

    const cached = await getCachedResult(assignmentId);
    if (cached) {
      res.json({ success: true, data: cached, fromCache: true });
      return;
    }

    const result = await Result.findOne({ assignmentId }).lean();
    if (!result) {
      res.status(404).json({ success: false, error: 'Result not found' });
      return;
    }

    await cacheResult(assignmentId, result);
    res.json({ success: true, data: result, fromCache: false });
  } catch (err) {
    next(err);
  }
}
