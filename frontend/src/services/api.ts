const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const publicApi = {
  // Fetch active admission sessions / circulars
  getSessions: async () => {
    try {
      const res = await fetch(`${API_BASE}/admissions/sessions`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Failed to fetch admission sessions:', err);
      return { success: false, data: [] };
    }
  },

  // Fetch branches, departments, subjects lookups
  getLookups: async () => {
    try {
      const res = await fetch(`${API_BASE}/academic/lookups`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Failed to fetch academic lookups:', err);
      return { success: false, branches: [], departments: [], subjects: [] };
    }
  },

  // Submit public admission application
  submitApplication: async (payload: Record<string, unknown>) => {
    const res = await fetch(`${API_BASE}/admissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Track registration by registrationNo or phone
  trackApplication: async (query: string) => {
    try {
      const res = await fetch(`${API_BASE}/admissions?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Failed to track application:', err);
      return { success: false, data: [] };
    }
  }
};
