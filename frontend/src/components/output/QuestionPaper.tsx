import { Result } from '@/types';

interface Props {
  result: Result;
  printRef?: React.RefObject<HTMLDivElement>;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Moderate',
  hard: 'Challenging',
};

export function QuestionPaper({ result, printRef }: Props) {
  const { metadata, sections } = result;
  let globalNumber = 0;

  return (
    <div
      ref={printRef}
      id="question-paper"
      className="bg-white rounded-2xl border border-gray-100 shadow-sm px-10 py-8 font-sans"
    >
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-xl font-bold text-gray-900">Delhi Public School, Sector-4, Bokaro</h1>
        <p className="font-semibold text-gray-800 mt-1">Subject: {metadata.subject}</p>
        {metadata.className && (
          <p className="font-semibold text-gray-800">Class: {metadata.className}</p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center justify-between text-sm font-semibold text-gray-800 mb-3">
        {metadata.duration ? (
          <span>Time Allowed: {metadata.duration} minutes</span>
        ) : <span />}
        <span>Maximum Marks: {metadata.totalMarks}</span>
      </div>

      {/* General instruction */}
      <p className="text-sm font-bold text-gray-900 mb-4">
        All questions are compulsory unless stated otherwise.
      </p>

      {/* Student info */}
      <div className="mb-6 space-y-1.5">
        <p className="text-sm text-gray-800">Name: <span className="inline-block border-b border-gray-600 w-40 ml-1" /></p>
        <p className="text-sm text-gray-800">Roll Number: <span className="inline-block border-b border-gray-600 w-32 ml-1" /></p>
        <p className="text-sm text-gray-800">
          Class: {metadata.className ? `${metadata.className} ` : ''}Section:{' '}
          <span className="inline-block border-b border-gray-600 w-20 ml-1" />
        </p>
      </div>

      {/* Sections */}
      {sections.map((section, si) => {
        return (
          <div key={section.id} className="mb-6">
            <h2 className="text-base font-bold text-gray-900 text-center mb-3">
              Section {String.fromCharCode(65 + si)}
            </h2>

            <h3 className="text-sm font-bold text-gray-900 mb-0.5">{section.title}</h3>
            <p className="text-sm italic text-gray-600 mb-3">{section.instruction}</p>

            <ol className="space-y-2.5">
              {section.questions.map((q) => {
                globalNumber += 1;
                const diff = DIFFICULTY_LABEL[q.difficulty] || q.difficulty;
                return (
                  <li key={q.id} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
                    <span className="flex-shrink-0 font-medium">{globalNumber}.</span>
                    <span className="flex-1">
                      [{diff}] {q.text} [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                      {q.options && q.options.length > 0 && (
                        <ol className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 list-none pl-0">
                          {q.options.map((opt, oi) => (
                            <li key={oi} className="text-sm text-gray-700">
                              ({String.fromCharCode(97 + oi)}) {opt}
                            </li>
                          ))}
                        </ol>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}

      {/* End of paper */}
      <p className="text-sm font-bold text-gray-900 mt-4 mb-6">End of Question Paper</p>

      {/* Answer Key */}
      {sections.some((s) => s.questions.some((q) => q.answer)) && (
        <div className="border-t border-gray-200 pt-5">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Answer Key:</h3>
          <ol className="space-y-2">
            {sections.flatMap((s) => s.questions).filter((q) => q.answer).map((q, i) => (
              <li key={q.id} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                <span className="flex-shrink-0">{i + 1}.</span>
                <span>{q.answer}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
