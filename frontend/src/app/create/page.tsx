import { Metadata } from 'next';
import { AssignmentForm } from '@/components/create/AssignmentForm';

export const metadata: Metadata = { title: 'Create Assignment — VedaAI' };

export default function CreatePage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-6">
      <AssignmentForm />
    </div>
  );
}
