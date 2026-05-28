import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  id: string;
  number: number;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
  answer?: string;
}

export interface ISection {
  id: string;
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IResultMetadata {
  title: string;
  subject: string;
  className?: string;
  totalMarks: number;
  duration?: number;
}

export interface IResult extends Document {
  assignmentId: mongoose.Types.ObjectId;
  metadata: IResultMetadata;
  sections: ISection[];
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    number: { type: Number, required: true },
    text: { type: String, required: true },
    type: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    marks: { type: Number, required: true },
    options: [{ type: String }],
    answer: { type: String },
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: [QuestionSchema],
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
    metadata: {
      title: { type: String, required: true },
      subject: { type: String, required: true },
      className: { type: String },
      totalMarks: { type: Number, required: true },
      duration: { type: Number },
    },
    sections: [SectionSchema],
  },
  { timestamps: true }
);

export const Result = mongoose.model<IResult>('Result', ResultSchema);
