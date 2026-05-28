import OpenAI from 'openai';
import { z } from 'zod';
import { IAssignment } from '../models/Assignment.js';
import { ISection, IResultMetadata } from '../models/Result.js';

const client = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const QuestionSchema = z.object({
  id: z.string(),
  number: z.number(),
  text: z.string().min(1),
  type: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().positive(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
});

const SectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  instruction: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

const ResponseSchema = z.object({
  metadata: z.object({
    title: z.string(),
    subject: z.string(),
    className: z.string().optional(),
    totalMarks: z.number(),
    duration: z.number().optional(),
  }),
  sections: z.array(SectionSchema).min(1),
});

function buildSystemPrompt(): string {
  return `You are an expert educator and exam paper designer for Indian schools.
Generate structured, high-quality exam papers as strict JSON.

RULES:
- Output ONLY valid JSON — no markdown, no code blocks, no extra text.
- Create one section per question type (e.g. Section A for MCQ, Section B for Short Answer).
- Each section title = the question type name (e.g. "Multiple Choice Questions").
- Questions must have sequential id ("q1","q2",...) and sequential number across sections.
- difficulty must be one of: "easy", "medium", "hard".
- For MCQ questions always include exactly 4 options.
- Include a concise answer for every question in the "answer" field.
- Total marks of all questions must exactly equal the requested totalMarks.
- Make questions appropriate for the subject and class level specified.`;
}

function buildUserPrompt(assignment: IAssignment): string {
  const configLines = assignment.questionTypeConfigs
    .map(
      (c) =>
        `  - ${c.type}: ${c.count} question${c.count > 1 ? 's' : ''} × ${c.marksPerQuestion} mark${c.marksPerQuestion > 1 ? 's' : ''} each = ${c.count * c.marksPerQuestion} marks`
    )
    .join('\n');

  let prompt = `Generate an exam paper with the following specifications:

Title: ${assignment.title}
Subject: ${assignment.subject}${assignment.className ? `\nClass: ${assignment.className}` : ''}
Total Marks: ${assignment.totalMarks}
Total Questions: ${assignment.numberOfQuestions}

Question Configuration:
${configLines}`;

  if (assignment.additionalInstructions) {
    prompt += `\n\nAdditional Instructions: ${assignment.additionalInstructions}`;
  }

  if (assignment.fileContent) {
    prompt += `\n\nReference Material (base questions on this):\n${assignment.fileContent.slice(0, 2500)}`;
  }

  prompt += `

Return ONLY JSON matching this exact schema:
{
  "metadata": {
    "title": string,
    "subject": string,
    "className": string (optional),
    "totalMarks": number,
    "duration": number (minutes, optional)
  },
  "sections": [
    {
      "id": string,
      "title": string,
      "instruction": string,
      "questions": [
        {
          "id": string,
          "number": number,
          "text": string,
          "type": string,
          "difficulty": "easy"|"medium"|"hard",
          "marks": number,
          "options": string[] (MCQ only, exactly 4),
          "answer": string
        }
      ]
    }
  ]
}`;

  return prompt;
}

export interface GeneratedPaper {
  metadata: IResultMetadata;
  sections: ISection[];
}

export async function generateQuestionPaper(assignment: IAssignment): Promise<GeneratedPaper> {
  const model = process.env.GROK_MODEL || 'grok-3-latest';

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: buildUserPrompt(assignment) },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const rawContent = response.choices[0]?.message?.content;
  if (!rawContent) throw new Error('Empty response from AI model');

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    throw new Error('AI returned invalid JSON');
  }

  const validated = ResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(`AI response failed validation: ${validated.error.message}`);
  }

  return validated.data as GeneratedPaper;
}
