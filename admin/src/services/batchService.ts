import { apiRequest } from './apiClient';

export interface BatchItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | string;
  createdAt: string;
  branchSubjectId: string;
  branchId: string;
  branchName: string;
  branchType: 'PHYSICAL' | 'ONLINE' | string;
  subjectId: string;
  subjectName: string;
  departmentId: string;
  departmentName: string;
  totalStudents: number;
  memberships?: BatchStudentItem[];
}

export interface BatchStudentItem {
  membershipId: string;
  studentId: string;
  id: string;
  personId: string;
  fullNameEn: string;
  fullNameBn?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender: string;
  bloodGroup?: string;
  photoUrl?: string;
  joinedAt: string;
  status: string;
}

export interface CreateBatchPayload {
  name: string;
  branchId: string;
  departmentId?: string;
  subjectId: string;
  status?: string;
}

export async function fetchBatches(params?: {
  branchId?: string;
  subjectId?: string;
  status?: string;
  search?: string;
}): Promise<BatchItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.branchId && params.branchId !== 'ALL') query.set('branchId', params.branchId);
    if (params?.subjectId && params.subjectId !== 'ALL') query.set('subjectId', params.subjectId);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await apiRequest<{ success: boolean; data: BatchItem[] }>(`/academic/batches${queryString}`);
    return res.data || [];
  } catch (error) {
    console.error('Failed to fetch batches from API:', error);
    return [];
  }
}

export async function createBatch(payload: CreateBatchPayload): Promise<BatchItem> {
  const res = await apiRequest<{ success: boolean; data: BatchItem }>('/academic/batches', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function updateBatch(id: string, payload: Partial<CreateBatchPayload>): Promise<BatchItem> {
  const res = await apiRequest<{ success: boolean; data: BatchItem }>(`/academic/batches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function deleteBatch(id: string): Promise<void> {
  await apiRequest(`/academic/batches/${id}`, {
    method: 'DELETE'
  });
}

export async function fetchBatchStudents(batchId: string): Promise<BatchStudentItem[]> {
  const res = await apiRequest<{ success: boolean; data: BatchStudentItem[] }>(`/academic/batches/${batchId}/students`);
  return res.data || [];
}

export async function enrollStudentInBatch(batchId: string, payload: { personId?: string; studentId?: string }): Promise<any> {
  const res = await apiRequest<{ success: boolean; data: any }>(`/academic/batches/${batchId}/students`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  return res.data;
}

export async function removeStudentFromBatch(batchId: string, membershipId: string): Promise<void> {
  await apiRequest(`/academic/batches/${batchId}/students/${membershipId}`, {
    method: 'DELETE'
  });
}

export async function fetchAcademicLookups(): Promise<{
  branches: Array<{ id: string; name: string; type: string }>;
  departments: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
}> {
  try {
    const [branchesRes, deptsRes, subsRes] = await Promise.all([
      apiRequest<{ success: boolean; data: any[] }>('/academic/branches').catch(() => ({ data: [] })),
      apiRequest<{ success: boolean; data: any[] }>('/academic/departments').catch(() => ({ data: [] })),
      apiRequest<{ success: boolean; data: any[] }>('/academic/subjects').catch(() => ({ data: [] }))
    ]);

    return {
      branches: branchesRes.data || [],
      departments: deptsRes.data || [],
      subjects: subsRes.data || []
    };
  } catch (err) {
    console.error('Failed to load academic lookups:', err);
    return { branches: [], departments: [], subjects: [] };
  }
}
