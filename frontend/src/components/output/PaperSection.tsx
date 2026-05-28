import { Section } from '@/types';
import { QuestionItem } from './QuestionItem';

interface Props {
  section: Section;
  questionOffset: number;
}

export function PaperSection({ section, questionOffset }: Props) {
  return (
    <div className="mt-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">
          {section.title}
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          {section.questions.reduce((sum, q) => sum + q.marks, 0)} Marks
        </span>
      </div>
      <p className="text-xs text-gray-500 italic mb-3">{section.instruction}</p>
      <div className="rounded border border-gray-200 bg-white divide-y divide-gray-100 px-2">
        {section.questions.map((q, i) => (
          <QuestionItem
            key={q.id}
            question={q}
            globalNumber={questionOffset + i + 1}
          />
        ))}
      </div>
    </div>
  );
}
