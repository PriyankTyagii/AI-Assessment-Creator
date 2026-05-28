import { Router } from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import {
  createAssignment,
  listAssignments,
  getAssignment,
  deleteAssignment,
  regenerateAssignment,
} from '../controllers/assignmentController.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['application/pdf', 'text/plain', 'image/jpeg', 'image/png'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, JPEG, and PNG files are allowed'));
    }
  },
});

const QuestionTypeConfigSchema = z.object({
  type: z.string().min(1),
  count: z.number().int().min(1),
  marksPerQuestion: z.number().int().min(1),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().min(1, 'Subject is required'),
  className: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  questionTypeConfigs: z
    .union([z.string(), z.array(z.unknown())])
    .transform((val) => {
      if (typeof val === 'string') return JSON.parse(val);
      return val;
    })
    .pipe(z.array(QuestionTypeConfigSchema).min(1)),
  additionalInstructions: z.string().optional(),
});

router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.delete('/:id', deleteAssignment);
router.post('/:id/regenerate', regenerateAssignment);

router.post(
  '/',
  upload.single('file'),
  async (req, _res, next) => {
    try {
      if (req.file) {
        if (req.file.mimetype === 'application/pdf') {
          const data = await pdfParse(req.file.buffer);
          req.body.fileContent = data.text;
        } else if (req.file.mimetype === 'text/plain') {
          req.body.fileContent = req.file.buffer.toString('utf-8');
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  validate(CreateAssignmentSchema),
  createAssignment
);

export default router;
