import { apiRequest } from './apiClient';

export type StaffRole = 'SUPER_ADMIN' | 'ACCOUNT_OFFICER' | 'STAFF' | 'COORDINATOR';

export interface AssignedDepartmentItem {
  id: string;
  departmentId: string;
  branchId?: string | null;
  department: {
    id: string;
    name: string;
    status: string;
  };
}

export interface AssignedBatchItem {
  id: string;
  batchId: string;
  batch: {
    id: string;
    name: string;
    status: string;
    branchSubject?: {
      branch?: { id: string; name: string; code?: string | null };
      subject?: { id: string; name: string; code?: string | null };
    };
  };
}

export interface StaffItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  designation?: string | null;
  photoUrl?: string | null;
  role: StaffRole | string;
  branchId?: string | null;
  branch?: {
    id: string;
    name: string;
    code?: string | null;
    type?: string | null;
  } | null;
  status: 'ACTIVE' | 'INACTIVE' | string;
  joiningDate?: string | null;
  notes?: string | null;
  studentId?: string | null;
  personId?: string | null;
  assignedDepartments?: AssignedDepartmentItem[];
  assignedBatches?: AssignedBatchItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phone?: string;
  designation?: string;
  role: StaffRole;
  branchId?: string | null;
  status?: string;
  joiningDate?: string;
  notes?: string;
  departmentIds?: string[];
  batchIds?: string[];
}

export const staffService = {
  async getStaff(params?: {
    role?: string;
    branchId?: string;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: StaffItem[] }> {
    const query = new URLSearchParams();
    if (params?.role && params.role !== 'ALL') query.set('role', params.role);
    if (params?.branchId && params.branchId !== 'ALL') query.set('branchId', params.branchId);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<{ success: boolean; data: StaffItem[] }>(`/staff${queryString}`);
  },

  async getStaffById(id: string): Promise<{ success: boolean; data: StaffItem }> {
    return apiRequest<{ success: boolean; data: StaffItem }>(`/staff/${id}`);
  },

  async createStaff(payload: CreateStaffPayload): Promise<{ success: boolean; data: StaffItem; message?: string }> {
    return apiRequest<{ success: boolean; data: StaffItem; message?: string }>('/staff', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateStaff(id: string, payload: Partial<CreateStaffPayload>): Promise<{ success: boolean; data: StaffItem; message?: string }> {
    return apiRequest<{ success: boolean; data: StaffItem; message?: string }>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async toggleStaffStatus(id: string): Promise<{ success: boolean; data: StaffItem }> {
    return apiRequest<{ success: boolean; data: StaffItem }>(`/staff/${id}/toggle-status`, {
      method: 'POST'
    });
  },

  async deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/staff/${id}`, {
      method: 'DELETE'
    });
  }
};
