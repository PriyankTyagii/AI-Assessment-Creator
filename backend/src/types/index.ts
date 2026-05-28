export type QuestionType = 'mcq' | 'short_answer' | 'long_answer' | 'true_false' | 'fill_blank';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';
export type AssignmentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CreateAssignmentDTO {
  title: string;
  subject: string;
  dueDate: string;
  questionTypes: QuestionType[];
  numberOfQuestions: number;
  totalMarks: number;
  difficulty: Difficulty;
  additionalInstructions?: string;
  fileContent?: string;
}

export interface QuestionData {
  id: string;
  number: number;
  text: string;
  type: QuestionType;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}

export interface SectionData {
  id: string;
  title: string;
  instruction: string;
  questions: QuestionData[];
}

export interface ResultMetadata {
  title: string;
  subject: string;
  totalMarks: number;
  duration?: number;
}

export interface GenerationJobData {
  assignmentId: string;
}

export type WSEventType = 'join' | 'progress' | 'completed' | 'failed';

export interface WSMessage {
  type: WSEventType;
  assignmentId?: string;
  message?: string;
  percent?: number;
  resultId?: string;
  error?: string;
}
