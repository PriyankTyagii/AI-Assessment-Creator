'use client';

import { useState } from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';
import { useGenerationStore } from '@/store/useGenerationStore';
import { createAssignment } from '@/lib/api';
import { FileUpload } from './FileUpload';
import { QuestionTypeRow } from './QuestionTypeRow';
import { GeneratingModal } from './GeneratingModal';
import { Plus, Mic, Calendar, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FormErrors {
  title?: string;
  subject?: string;
  dueDate?: string;
  questionTypeConfigs?: string;
}

export function AssignmentForm() {
  const router = useRouter();
  const { form, setField, addQuestionType, removeQuestionType, updateQuestionType, resetForm } =
    useAssignmentStore();
  const { reset: resetGeneration } = useGenerationStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const totalQuestions = form.questionTypeConfigs.reduce((s, c) => s + c.count, 0);
  const totalMarks = form.questionTypeConfigs.reduce((s, c) => s + c.count * c.marksPerQuestion, 0);

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.subject.trim()) errs.subject = 'Required';
    if (!form.dueDate) errs.dueDate = 'Required';
    if (form.questionTypeConfigs.length === 0) errs.questionTypeConfigs = 'Add at least one question type';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleNext() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('subject', form.subject);
      fd.append('className', form.className);
      fd.append('dueDate', form.dueDate);
      fd.append('questionTypeConfigs', JSON.stringify(form.questionTypeConfigs));
      if (form.additionalInstructions) fd.append('additionalInstructions', form.additionalInstructions);
      if (form.file) fd.append('file', form.file);

      const assignment = await createAssignment(fd);
      resetGeneration();
      setGeneratingId(assignment._id);
    } catch {
      setErrors({ title: 'Failed to create. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Mobile back header */}
      <div className="md:hidden flex items-center gap-4 mb-4">
        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h1 className="text-base font-bold text-gray-900">Create Assignment</h1>
      </div>

      {/* Desktop page header */}
      <div className="hidden md:flex mb-4 items-start gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set up a new assignment for your students</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        <div className="h-1.5 flex-1 rounded-full bg-gray-900" />
        <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-0.5">Assignment Details</h2>
        <p className="text-sm text-gray-500 mb-5">Basic information about your assignment</p>

        {/* Title + Subject + Class row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
            <input
              type="text"
              placeholder="e.g. Quiz on Electricity"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 placeholder-gray-400"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
            <input
              type="text"
              placeholder="e.g. Science"
              value={form.subject}
              onChange={(e) => setField('subject', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 placeholder-gray-400"
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
            <input
              type="text"
              placeholder="e.g. 5th"
              value={form.className}
              onChange={(e) => setField('className', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 placeholder-gray-400"
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-5">
          <FileUpload file={form.file} onFileChange={(f) => setField('file', f)} />
        </div>

        {/* Due Date */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
          <div className="relative">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setField('dueDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              placeholder="DD-MM-YYYY"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 text-gray-700 appearance-none"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.dueDate && <p className="text-xs text-red-500 mt-1">{errors.dueDate}</p>}
        </div>

        {/* Question Types */}
        <div className="mb-5">
          <div className="flex items-center mb-3">
            <span className="text-sm font-semibold text-gray-700 flex-1">Question Type</span>
            <span className="text-sm font-semibold text-gray-700 w-28 text-center">No. of Questions</span>
            <span className="text-sm font-semibold text-gray-700 w-24 text-center">Marks</span>
          </div>

          <div className="flex flex-col gap-2.5">
            {form.questionTypeConfigs.map((config) => (
              <QuestionTypeRow
                key={config.id}
                config={config}
                showRemove={form.questionTypeConfigs.length > 1}
                onRemove={() => removeQuestionType(config.id)}
                onTypeChange={(v) => updateQuestionType(config.id, 'type', v)}
                onCountChange={(v) => updateQuestionType(config.id, 'count', v)}
                onMarksChange={(v) => updateQuestionType(config.id, 'marksPerQuestion', v)}
              />
            ))}
          </div>

          {errors.questionTypeConfigs && (
            <p className="text-xs text-red-500 mt-1">{errors.questionTypeConfigs}</p>
          )}

          <button
            type="button"
            onClick={addQuestionType}
            className="flex items-center gap-2.5 mt-3 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
          >
            <span className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0">
              <Plus className="w-3.5 h-3.5" />
            </span>
            Add Question Type
          </button>

          {/* Totals */}
          <div className="mt-3 text-right text-sm text-gray-700 space-y-0.5">
            <p><span className="font-medium">Total Questions :</span> {totalQuestions}</p>
            <p><span className="font-medium">Total Marks :</span> {totalMarks}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Information <span className="font-normal text-gray-400">(For better output)</span>
          </label>
          <div className="relative">
            <textarea
              rows={4}
              placeholder="e.g Generate a question paper for 3 hour exam duration..."
              value={form.additionalInstructions}
              onChange={(e) => setField('additionalInstructions', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 resize-none"
            />
            <button
              type="button"
              className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between mt-6">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium text-sm py-2.5 px-7 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm py-2.5 px-8 rounded-full transition-colors disabled:opacity-60 shadow-sm"
        >
          {submitting ? 'Creating…' : 'Next →'}
        </button>
      </div>

      {generatingId && (
        <GeneratingModal
          assignmentId={generatingId}
          onClose={() => { setGeneratingId(null); resetGeneration(); }}
        />
      )}
    </>
  );
}
