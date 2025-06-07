
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferences: Record<string, any>;
  points: number;
  tier: string;
  created_at: string;
  updated_at: string;
};

export type Trip = {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  style?: string[];
  status: string;
  itinerary: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  trip_id?: string;
  content?: string;
  media_urls?: string[];
  location?: Record<string, any>;
  likes_count: number;
  created_at: string;
  updated_at: string;
};

export type Place = {
  id: string;
  name: string;
  description?: string;
  location?: Record<string, any>;
  category?: string[];
  rating?: number;
  price_range?: string;
  operating_hours: Record<string, any>;
  created_at: string;
  updated_at: string;
};
