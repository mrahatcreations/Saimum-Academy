import { apiRequest } from './apiClient';
import type { FormFieldConfig } from '../types/formBuilder';

export const formBuilderService = {
  // 1. Fetch configured form fields
  async getFields(): Promise<{ success: boolean; data: FormFieldConfig[] }> {
    return apiRequest<{ success: boolean; data: FormFieldConfig[] }>('/form-builder/fields');
  },

  // 2. Save & Publish all form fields
  async saveFields(fields: FormFieldConfig[]): Promise<{ success: boolean; data: FormFieldConfig[]; message: string }> {
    return apiRequest<{ success: boolean; data: FormFieldConfig[]; message: string }>('/form-builder/fields', {
      method: 'PUT',
      body: JSON.stringify({ fields })
    });
  }
};
