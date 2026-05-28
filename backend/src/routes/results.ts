import { Router } from 'express';
import { getResult } from '../controllers/resultController.js';

const router = Router();

router.get('/:assignmentId', getResult);

export default router;
