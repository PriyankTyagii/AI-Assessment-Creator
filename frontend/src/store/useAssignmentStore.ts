import { create } from 'zustand';
import { AssignmentFormData, QuestionTypeConfig } from '@/types';

const DEFAULT_TYPES: QuestionTypeConfig[] = [
  { id: '1', type: 'Multiple Choice Questions', count: 4, marksPerQuestion: 1 },
  { id: '2', type: 'Short Questions', count: 3, marksPerQuestion: 2 },
];

const defaultForm: AssignmentFormData = {
  title: '',
  subject: '',
  className: '',
  dueDate: '',
  questionTypeConfigs: DEFAULT_TYPES,
  additionalInstructions: '',
  file: null,
};

interface AssignmentStore {
  form: AssignmentFormData;
  setField: <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, field: keyof Omit<QuestionTypeConfig, 'id'>, value: string | number) => void;
  resetForm: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  form: { ...defaultForm, questionTypeConfigs: DEFAULT_TYPES.map((t) => ({ ...t })) },

  setField: (key, value) =>
    set((state) => ({ form: { ...state.form, [key]: value } })),

  addQuestionType: () =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypeConfigs: [
          ...state.form.questionTypeConfigs,
          { id: Date.now().toString(), type: 'Short Questions', count: 3, marksPerQuestion: 2 },
        ],
      },
    })),

  removeQuestionType: (id) =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypeConfigs: state.form.questionTypeConfigs.filter((c) => c.id !== id),
      },
    })),

  updateQuestionType: (id, field, value) =>
    set((state) => ({
      form: {
        ...state.form,
        questionTypeConfigs: state.form.questionTypeConfigs.map((c) =>
          c.id === id ? { ...c, [field]: value } : c
        ),
      },
    })),

  resetForm: () =>
    set({
      form: {
        ...defaultForm,
        questionTypeConfigs: DEFAULT_TYPES.map((t) => ({ ...t })),
      },
    }),
}));
