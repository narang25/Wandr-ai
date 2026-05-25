// ────────────────────────────────────────────────────────────────
// Wandr.ai — Core TypeScript interfaces
// ────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  time: string;
  name: string;
  description: string;
  category: string;
  estimatedCost: number;
  location: {
    lat: number;
    lng: number;
  };
  duration?: string;
}

export interface DayPlan {
  day: number;
  title: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  transport: number;
  total: number;
}

export interface Hotel {
  name: string;
  tier: 'Budget' | 'Mid-Range' | 'Luxury';
  pricePerNight: number;
  rating: number;
  amenities: string[];
  description: string;
  emoji: string;
}

export interface QuickFacts {
  bestTimeToVisit: string;
  currency: string;
  language: string;
  timezone: string;
  visaRequirements?: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface Trip {
  _id: string;
  userId: string;
  destination: string;
  startDate: string;
  days: number;
  budget: 'Budget' | 'Mid-Range' | 'Luxury';
  interests: string[];
  status: 'pending' | 'generating' | 'ready' | 'error';
  itinerary: DayPlan[];
  budgetBreakdown: BudgetBreakdown;
  hotels: Hotel[];
  quickFacts: QuickFacts;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}
