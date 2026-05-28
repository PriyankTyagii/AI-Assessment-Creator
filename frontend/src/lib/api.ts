import axios from 'axios';
import { Assignment, Result } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

export async function createAssignment(formData: FormData): Promise<Assignment> {
  const { data } = await api.post('/api/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function listAssignments(page = 1): Promise<{
  data: Assignment[];
  pagination: { page: number; limit: number; total: number };
}> {
  const { data } = await api.get('/api/assignments', { params: { page } });
  return data;
}

export async function getAssignment(id: string): Promise<Assignment> {
  const { data } = await api.get(`/api/assignments/${id}`);
  return data.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/api/assignments/${id}`);
}

export async function regenerateAssignment(id: string): Promise<void> {
  await api.post(`/api/assignments/${id}/regenerate`);
}

export async function getResult(assignmentId: string): Promise<Result> {
  const { data } = await api.get(`/api/results/${assignmentId}`);
  return data.data;
}
