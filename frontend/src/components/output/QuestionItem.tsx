import { Question } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';

interface Props {
  question: Question;
  globalNumber: number;
}

export function QuestionItem({ question, globalNumber }: Props) {
  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <span className="font-semibold text-gray-700 text-sm min-w-[1.5rem] pt-0.5">
            {globalNumber}.
          </span>
          <div className="flex-1">
            <p className="text-gray-800 text-sm leading-relaxed">{question.text}</p>

            {question.options && question.options.length > 0 && (
              <ol
                className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1"
                type="A"
              >
                {question.options.map((opt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="font-medium text-gray-500 min-w-[1.25rem]">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <DifficultyBadge difficulty={question.difficulty} />
          <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
            [{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}]
          </span>
        </div>
      </div>
    </div>
  );
}
