const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('wandr_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(data: { name: string; email: string; password: string }) {
    return this.request<{ token: string; user: import('./types').User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ token: string; user: import('./types').User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ user: import('./types').User }>('/api/auth/me');
  }

  // Trips
  async getTrips() {
    return this.request<{ trips: import('./types').Trip[] }>('/api/trips');
  }

  async getTrip(id: string) {
    return this.request<{ trip: import('./types').Trip }>(`/api/trips/${id}`);
  }

  async createTrip(data: { destination: string; days: number; budget: string; interests: string[] }) {
    return this.request<{ trip: import('./types').Trip }>('/api/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateTrip(id: string) {
    return this.request<{ message: string; trip: import('./types').Trip }>(`/api/trips/${id}/generate`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
