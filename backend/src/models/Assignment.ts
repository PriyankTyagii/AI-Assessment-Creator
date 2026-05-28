import mongoose, { Document, Schema } from 'mongoose';
import { AssignmentStatus } from '../types/index.js';

export interface IQuestionTypeConfig {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className?: string;
  dueDate: Date;
  questionTypeConfigs: IQuestionTypeConfig[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileContent?: string;
  status: AssignmentStatus;
  jobId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    questionTypeConfigs: { type: [QuestionTypeConfigSchema], required: true },
    numberOfQuestions: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    additionalInstructions: { type: String },
    fileContent: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    jobId: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);
