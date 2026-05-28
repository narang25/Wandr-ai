const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

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

  async createTrip(data: { destination: string; startDate: string; days: number; budget: string; interests: string[] }) {
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

  // Itinerary Editing
  async removeActivity(tripId: string, dayIndex: number, activityId: string) {
    return this.request<{ trip: import('./types').Trip }>(`/api/trips/${tripId}/itinerary/remove`, {
      method: 'PUT',
      body: JSON.stringify({ dayIndex, activityId }),
    });
  }

  async addActivity(tripId: string, dayIndex: number, activity: { time: string; name: string; description: string; category: string; estimatedCost: number }) {
    return this.request<{ trip: import('./types').Trip }>(`/api/trips/${tripId}/itinerary/add`, {
      method: 'PUT',
      body: JSON.stringify({ dayIndex, activity }),
    });
  }

  async regenerateDay(tripId: string, dayNumber: number, instructions?: string) {
    return this.request<{ trip: import('./types').Trip }>(`/api/trips/${tripId}/regenerate-day`, {
      method: 'POST',
      body: JSON.stringify({ dayNumber, instructions }),
    });
  }

  async deleteTrip(id: string) {
    return this.request<{ message: string }>(`/api/trips/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateTrip(id: string) {
    return this.request<{ trip: import('./types').Trip }>(`/api/trips/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async getPackingList(tripId: string) {
    return this.request<{ packingList: { categories: Array<{ name: string; emoji: string; items: string[] }> } }>(`/api/trips/${tripId}/packing-list`, {
      method: 'POST',
    });
  }

  async toggleTripSharing(id: string) {
    return this.request<{ trip: import('./types').Trip }>(`/api/trips/${id}/share`, {
      method: 'PUT',
    });
  }

  async getPublicTrip(id: string) {
    return this.request<{ trip: import('./types').Trip }>(`/api/public/trips/${id}`);
  }
}

export const api = new ApiClient();

