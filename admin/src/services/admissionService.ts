import { apiRequest } from './apiClient';
import type { Registration, AdmissionSession, AdmissionStatus } from '../types/admission';

export interface GetAdmissionsParams {
  status?: string;
  branchId?: string;
  search?: string;
  year?: number;
  sessionId?: string;
}

export const admissionService = {
  // 1. Fetch all admissions with optional filters
  async getAdmissions(params: GetAdmissionsParams = {}): Promise<{ success: boolean; data: Registration[]; total: number }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.branchId && params.branchId !== 'ALL') query.append('branchId', params.branchId);
    if (params.search) query.append('search', params.search);
    if (params.year) query.append('year', String(params.year));
    if (params.sessionId && params.sessionId !== 'ALL') query.append('sessionId', params.sessionId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<{ success: boolean; data: Registration[]; total: number }>(`/admissions${queryString}`);
  },

  // 2. Fetch single admission details
  async getAdmissionById(id: string): Promise<{ success: boolean; data: Registration }> {
    return apiRequest<{ success: boolean; data: Registration }>(`/admissions/${id}`);
  },

  // 3. Create new admission (Desk entry or Online)
  async createAdmission(data: Partial<Registration>): Promise<{ success: boolean; data: Registration; message: string }> {
    return apiRequest<{ success: boolean; data: Registration; message: string }>('/admissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 4. Update admission & person details
  async updateAdmission(id: string, data: Partial<Registration>): Promise<{ success: boolean; data: Registration; message: string }> {
    return apiRequest<{ success: boolean; data: Registration; message: string }>(`/admissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 4b. Delete admission
  async deleteAdmission(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/admissions/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Schedule Viva Exam
  async scheduleViva(
    id: string, 
    details: { vivaDate: string; vivaTime: string; room: string; examinerPanel: string }
  ): Promise<{ success: boolean; data: Registration; message: string }> {
    return apiRequest<{ success: boolean; data: Registration; message: string }>(`/admissions/${id}/schedule-viva`, {
      method: 'POST',
      body: JSON.stringify(details)
    });
  },

  // 6. Update status (Pass/Select for Workshop or Reject)
  async updateStatus(
    id: string, 
    status: AdmissionStatus | string,
    vivaScore?: number,
    vivaNotes?: string
  ): Promise<{ success: boolean; data: Registration; message: string }> {
    return apiRequest<{ success: boolean; data: Registration; message: string }>(`/admissions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, vivaScore, vivaNotes })
    });
  },

  // 7. Get All Admission Sessions / Circulars
  async getSessions(): Promise<{ success: boolean; data: AdmissionSession[] }> {
    return apiRequest<{ success: boolean; data: AdmissionSession[] }>('/admissions/sessions');
  },

  // 8. Create New Admission Session
  async createSession(data: Partial<AdmissionSession>): Promise<{ success: boolean; data: AdmissionSession; message: string }> {
    return apiRequest<{ success: boolean; data: AdmissionSession; message: string }>('/admissions/sessions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 9. Update Admission Session
  async updateSession(id: string, data: Partial<AdmissionSession>): Promise<{ success: boolean; data: AdmissionSession; message: string }> {
    return apiRequest<{ success: boolean; data: AdmissionSession; message: string }>(`/admissions/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // 10. Toggle Session Active / Closed
  async toggleSessionActive(id: string): Promise<{ success: boolean; data: AdmissionSession; message: string }> {
    return apiRequest<{ success: boolean; data: AdmissionSession; message: string }>(`/admissions/sessions/${id}/toggle-active`, {
      method: 'PATCH'
    });
  },

  // 11. Delete Admission Session
  async deleteSession(id: string): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/admissions/sessions/${id}`, {
      method: 'DELETE'
    });
  },

  // 12. Bulk Schedule Viva for multiple candidates
  async bulkScheduleViva(
    registrationIds: string[],
    details: { vivaDate: string; vivaTime: string; room: string; examinerPanel: string }
  ): Promise<{ success: boolean; count: number; message: string }> {
    return apiRequest<{ success: boolean; count: number; message: string }>('/admissions/bulk-schedule-viva', {
      method: 'POST',
      body: JSON.stringify({ registrationIds, ...details })
    });
  },

  // 13. Bulk Update Status (Select / Reject / Move)
  async bulkUpdateStatus(
    registrationIds: string[],
    status: string,
    vivaScore?: number,
    vivaNotes?: string
  ): Promise<{ success: boolean; count: number; message: string }> {
    return apiRequest<{ success: boolean; count: number; message: string }>('/admissions/bulk-update-status', {
      method: 'POST',
      body: JSON.stringify({ registrationIds, status, vivaScore, vivaNotes })
    });
  },

  // 14. Bulk Enroll Admitted Registrations into a specific Batch (with Strict Isolation)
  async bulkEnrollToBatch(
    batchId: string,
    registrationIds: string[]
  ): Promise<{ success: boolean; count: number; message: string }> {
    return apiRequest<{ success: boolean; count: number; message: string }>(`/academic/batches/${batchId}/bulk-enroll`, {
      method: 'POST',
      body: JSON.stringify({ registrationIds })
    });
  }
};
