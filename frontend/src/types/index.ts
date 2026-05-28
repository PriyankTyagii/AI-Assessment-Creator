export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface QuestionTypeConfig {
  id: string;
  type: string;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentFormData {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypeConfigs: QuestionTypeConfig[];
  additionalInstructions: string;
  file: File | null;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  className?: string;
  dueDate: string;
  questionTypeConfigs: QuestionTypeConfig[];
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
  answer?: string;
}

export interface Section {
  id: string;
  title: string;
  instruction: string;
  questions: Question[];
}

export interface ResultMetadata {
  title: string;
  subject: string;
  className?: string;
  totalMarks: number;
  duration?: number;
}

export interface Result {
  _id: string;
  assignmentId: string;
  metadata: ResultMetadata;
  sections: Section[];
  createdAt: string;
}

export type WSEventType = 'progress' | 'completed' | 'failed';

export interface WSEvent {
  type: WSEventType;
  message?: string;
  percent?: number;
  resultId?: string;
  error?: string;
}
