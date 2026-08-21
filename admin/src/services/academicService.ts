import { apiRequest } from './apiClient';

export interface BranchItem {
  id: string;
  name: string;
  code: string | null;
  type: 'PHYSICAL' | 'ONLINE';
  status: 'ACTIVE' | 'INACTIVE';
  departments?: Array<{ department: { id: string; name: string } }>;
  staff?: Array<{ id: string; fullName: string; role: string; designation?: string; phone?: string; status: string }>;
  _count?: { registrations: number; subjects: number; workshopBatches?: number };
}

export interface DepartmentItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  branchCount: number;
  branches?: Array<{ id: string; name: string; code?: string; type?: string }>;
  staffCount?: number;
  faculty?: Array<{ id: string; fullName: string; role: string; designation?: string; phone?: string; branchId?: string }>;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BatchItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED';
  createdAt: string;
  branchSubjectId: string;
  branchId: string;
  branchName: string;
  branchType?: string;
  subjectId: string;
  subjectName: string;
  departmentId?: string;
  departmentName?: string;
  totalStudents: number;
  coordinators?: Array<{
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    designation?: string;
  }>;
  memberships?: Array<{
    id: string;
    studentId: string;
    fullNameEn: string;
    fullNameBn?: string;
    phone?: string;
    joinedAt: string;
    status: string;
  }>;
}

export interface StudentItem {
  id: string;
  studentId: string;
  fullName: string;
  fullNameBn?: string;
  phone: string;
  email?: string;
  gender?: string;
  bloodGroup?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  personId?: string;
  enrolledBatches?: Array<{
    batchId: string;
    batchName: string;
    branchName: string;
    subjectName: string;
    joinedAt: string;
  }>;
}

export const academicService = {
  // Branches
  async getBranches(): Promise<{ success: boolean; data: BranchItem[] }> {
    return apiRequest('/academic/branches');
  },
  async createBranch(payload: { name: string; code?: string; type?: string; status?: string; departmentIds?: string[] }): Promise<{ success: boolean; data: BranchItem }> {
    return apiRequest('/academic/branches', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateBranch(id: string, payload: Partial<BranchItem> & { departmentIds?: string[] }): Promise<{ success: boolean; data: BranchItem }> {
    return apiRequest(`/academic/branches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  async deleteBranch(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/academic/branches/${id}`, { method: 'DELETE' });
  },

  // Departments
  async getDepartments(): Promise<{ success: boolean; data: DepartmentItem[] }> {
    return apiRequest('/academic/departments');
  },
  async createDepartment(payload: { name: string; status?: string; branchIds?: string[] }): Promise<{ success: boolean; data: DepartmentItem }> {
    return apiRequest('/academic/departments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateDepartment(id: string, payload: Partial<DepartmentItem> & { branchIds?: string[] }): Promise<{ success: boolean; data: DepartmentItem }> {
    return apiRequest(`/academic/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  async deleteDepartment(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/academic/departments/${id}`, { method: 'DELETE' });
  },

  // Subjects
  async getSubjects(): Promise<{ success: boolean; data: SubjectItem[] }> {
    return apiRequest('/academic/subjects');
  },
  async createSubject(payload: { name: string; code?: string; status?: string }): Promise<{ success: boolean; data: SubjectItem }> {
    return apiRequest('/academic/subjects', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateSubject(id: string, payload: Partial<SubjectItem>): Promise<{ success: boolean; data: SubjectItem }> {
    return apiRequest(`/academic/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  async deleteSubject(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/academic/subjects/${id}`, { method: 'DELETE' });
  },

  // Batches
  async getBatches(params?: { branchId?: string; subjectId?: string; status?: string; search?: string }): Promise<{ success: boolean; data: BatchItem[]; total: number }> {
    const q = new URLSearchParams();
    if (params?.branchId && params.branchId !== 'ALL') q.set('branchId', params.branchId);
    if (params?.subjectId && params.subjectId !== 'ALL') q.set('subjectId', params.subjectId);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiRequest(`/academic/batches${queryStr}`);
  },
  async createBatch(payload: { name: string; branchId: string; subjectId: string; departmentId?: string; status?: string }): Promise<{ success: boolean; data: BatchItem; message?: string }> {
    return apiRequest('/academic/batches', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateBatch(id: string, payload: { name?: string; status?: string }): Promise<{ success: boolean; data: BatchItem }> {
    return apiRequest(`/academic/batches/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  async deleteBatch(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/academic/batches/${id}`, { method: 'DELETE' });
  },

  // Students
  async getStudents(params?: { search?: string; status?: string }): Promise<{ success: boolean; data: StudentItem[] }> {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.status && params.status !== 'ALL') q.set('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiRequest(`/academic/students${queryStr}`);
  },
  async createStudent(payload: { fullName: string; phone?: string; email?: string; status?: string }): Promise<{ success: boolean; data: StudentItem }> {
    return apiRequest('/academic/students', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  async updateStudent(id: string, payload: Partial<StudentItem>): Promise<{ success: boolean; data: StudentItem }> {
    return apiRequest(`/academic/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  async deleteStudent(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest(`/academic/students/${id}`, { method: 'DELETE' });
  }
};
