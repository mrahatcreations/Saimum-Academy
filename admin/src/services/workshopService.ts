import { apiRequest } from './apiClient';

export interface WorkshopModeratorItem {
  id: string;
  workshopBatchId: string;
  staffId: string;
  role: 'PRIMARY_MODERATOR' | 'ASSISTANT_MODERATOR' | string;
  staff: {
    id: string;
    fullName: string;
    phone?: string | null;
    role: string;
    designation?: string | null;
  };
}

export interface WorkshopEnrollmentItem {
  id: string;
  workshopBatchId: string;
  personId?: string | null;
  registrationNo?: string | null;
  studentName: string;
  studentPhone?: string | null;
  status: 'ENROLLED' | 'COMPLETED' | 'DROPPED' | string;
  attendanceRate: number;
  attendanceScore?: number;
  classTestScore?: number;
  finalExamScore?: number;
  vivaScore?: number;
  compositeScore?: number;
  totalScore?: number;
  finalGrade?: string | null;
  isQualifiedRegular?: boolean;
}

export interface WorkshopRotationalSlotItem {
  id: string;
  workshopBatchId: string;
  dayOfWeek: string;
  timeSlot: string;
  subjectName: string;
  guestInstructorName?: string | null;
  roomNo?: string | null;
}

export interface WorkshopResourceItem {
  id: string;
  workshopBatchId: string;
  title: string;
  type: 'LYRICS' | 'SCRIPT' | 'LECTURE_NOTE' | string;
  content?: string | null;
  fileUrl?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
}

export interface WorkshopBatchItem {
  id: string;
  sessionId: string;
  name: string;
  scheduleDays?: string | null;
  timeSlot?: string | null;
  shift?: 'MORNING' | 'AFTERNOON' | 'EVENING' | string;
  roomNo?: string | null;
  maxCapacity: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED' | 'INACTIVE' | string;
  branchId?: string | null;
  moderators?: WorkshopModeratorItem[];
  enrollments?: WorkshopEnrollmentItem[];
  rotationalSchedules?: WorkshopRotationalSlotItem[];
  resources?: WorkshopResourceItem[];
  createdAt: string;
}

export interface WorkshopSessionItem {
  id: string;
  title: string;
  code?: string | null;
  year: number;
  startDate?: string | null;
  endDate?: string | null;
  targetCapacity: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED' | string;
  description?: string | null;
  branchId?: string | null;
  branch?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
  batches: WorkshopBatchItem[];
  createdAt: string;
}

export interface CreateWorkshopPayload {
  title: string;
  code?: string;
  year?: number;
  startDate?: string;
  endDate?: string;
  targetCapacity?: number;
  status?: string;
  description?: string;
  branchId?: string | null;
}

export interface CreateWorkshopBatchPayload {
  name: string;
  scheduleDays?: string;
  timeSlot?: string;
  shift?: string;
  roomNo?: string;
  maxCapacity?: number;
  branchId?: string | null;
}

export const workshopService = {
  async getWorkshops(): Promise<{ success: boolean; data: WorkshopSessionItem[] }> {
    return apiRequest<{ success: boolean; data: WorkshopSessionItem[] }>('/workshops');
  },

  async getWorkshopById(id: string): Promise<{ success: boolean; data: WorkshopSessionItem }> {
    return apiRequest<{ success: boolean; data: WorkshopSessionItem }>(`/workshops/${id}`);
  },

  async createWorkshop(payload: CreateWorkshopPayload): Promise<{ success: boolean; data: WorkshopSessionItem; message?: string }> {
    return apiRequest<{ success: boolean; data: WorkshopSessionItem; message?: string }>('/workshops', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateWorkshop(id: string, payload: Partial<CreateWorkshopPayload>): Promise<{ success: boolean; data: WorkshopSessionItem; message?: string }> {
    return apiRequest<{ success: boolean; data: WorkshopSessionItem; message?: string }>(`/workshops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteWorkshop(id: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>(`/workshops/${id}`, {
      method: 'DELETE'
    });
  },

  async updateWorkshopStatus(id: string, status: string): Promise<{ success: boolean; data: WorkshopSessionItem; message?: string }> {
    return apiRequest<{ success: boolean; data: WorkshopSessionItem; message?: string }>(`/workshops/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async createBatch(sessionId: string, payload: CreateWorkshopBatchPayload): Promise<{ success: boolean; data: WorkshopBatchItem; message?: string }> {
    return apiRequest<{ success: boolean; data: WorkshopBatchItem; message?: string }>(`/workshops/${sessionId}/batches`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async assignModerators(batchId: string, staffIds: string[]): Promise<{ success: boolean; data: WorkshopModeratorItem[]; message?: string }> {
    return apiRequest<{ success: boolean; data: WorkshopModeratorItem[]; message?: string }>(`/workshops/batches/${batchId}/moderators`, {
      method: 'POST',
      body: JSON.stringify({ staffIds })
    });
  },

  async enrollCandidates(batchId: string, candidates: any[]): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>(`/workshops/batches/${batchId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ candidates })
    });
  },

  async getRotationMatrix(sessionId: string): Promise<{ success: boolean; data: WorkshopBatchItem[] }> {
    return apiRequest<{ success: boolean; data: WorkshopBatchItem[] }>(`/workshops/${sessionId}/rotation-matrix`);
  },

  async addRotationSlot(payload: {
    workshopBatchId: string;
    dayOfWeek: string;
    timeSlot: string;
    subjectName: string;
    guestInstructorName?: string;
    roomNo?: string;
  }): Promise<{ success: boolean; data: any; message?: string }> {
    return apiRequest<{ success: boolean; data: any; message?: string }>('/workshops/rotation-matrix', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateBatch(batchId: string, payload: Partial<CreateWorkshopBatchPayload> & { status?: string }): Promise<{ success: boolean; data: WorkshopBatchItem; message?: string }> {
    return apiRequest<{ success: boolean; data: WorkshopBatchItem; message?: string }>(`/workshops/batches/${batchId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteBatch(batchId: string): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>(`/workshops/batches/${batchId}`, {
      method: 'DELETE'
    });
  },

  async getResources(batchId: string): Promise<{ success: boolean; data: WorkshopResourceItem[] }> {
    return apiRequest<{ success: boolean; data: WorkshopResourceItem[] }>(`/workshops/batches/${batchId}/resources`);
  },

  async createResource(batchId: string, payload: {
    title: string;
    type?: string;
    content?: string;
    uploadedBy?: string;
  }): Promise<{ success: boolean; data: WorkshopResourceItem; message?: string }> {
    return apiRequest<{ success: boolean; data: WorkshopResourceItem; message?: string }>(`/workshops/batches/${batchId}/resources`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async assignApplicant(batchId: string, payload: { registrationId: string; personId?: string; studentName?: string; studentPhone?: string }): Promise<{ success: boolean; data?: any; message?: string }> {
    return apiRequest<{ success: boolean; data?: any; message?: string }>(`/workshops/batches/${batchId}/assign-applicant`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async bulkAssignApplicants(batchId: string, registrationIds: string[]): Promise<{ success: boolean; data?: { assignedCount: number }; message?: string }> {
    return apiRequest<{ success: boolean; data?: { assignedCount: number }; message?: string }>(`/workshops/batches/${batchId}/bulk-assign`, {
      method: 'POST',
      body: JSON.stringify({ registrationIds })
    });
  },

  async saveBatchMarksheet(batchId: string, marks: Array<{ enrollmentId: string; classTestScore: number; finalExamScore: number }>): Promise<{ success: boolean; message: string }> {
    return apiRequest<{ success: boolean; message: string }>(`/workshops/batches/${batchId}/marksheet`, {
      method: 'POST',
      body: JSON.stringify({ marks })
    });
  },

  async autoAllocateWorkshop(sessionId: string): Promise<{ success: boolean; data?: { allocatedCount: number }; message?: string }> {
    return apiRequest<{ success: boolean; data?: { allocatedCount: number }; message?: string }>(`/workshops/sessions/${sessionId}/auto-allocate`, {
      method: 'POST'
    });
  },

  async scanQrAttendance(payload: {
    qrCodePayload: string;
    staffId?: string;
    scanDate?: string;
    scanTime?: string;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    return apiRequest<{ success: boolean; data?: any; message?: string }>('/workshops/attendance/scan-qr', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getAssessments(batchId: string): Promise<{ success: boolean; data: any[] }> {
    return apiRequest<{ success: boolean; data: any[] }>(`/workshops/batches/${batchId}/assessments`);
  },

  async createAssessment(batchId: string, payload: {
    title: string;
    type?: 'CLASS_TEST' | 'WEEKLY_QUIZ' | 'FINAL_PRACTICAL';
    date?: string;
    totalMarks?: number;
    weightPercentage?: number;
  }): Promise<{ success: boolean; data?: any; message?: string }> {
    return apiRequest<{ success: boolean; data?: any; message?: string }>(`/workshops/batches/${batchId}/assessments`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async saveAssessmentScores(assessmentId: string, scores: Array<{
    enrollmentId: string;
    marksObtained: number;
    feedback?: string;
  }>): Promise<{ success: boolean; message?: string }> {
    return apiRequest<{ success: boolean; message?: string }>(`/workshops/assessments/${assessmentId}/scores`, {
      method: 'POST',
      body: JSON.stringify({ scores })
    });
  },

  async graduateToRegular(batchId: string, payload: {
    enrollmentId: string;
    regularBatchId?: string;
  }): Promise<{ success: boolean; data?: { studentId: string }; message?: string }> {
    return apiRequest<{ success: boolean; data?: { studentId: string }; message?: string }>(`/workshops/batches/${batchId}/graduate-to-regular`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
