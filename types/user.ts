export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | string;
  level?: number;
  experience: "beginner" | "intermediate" | "advanced" | "expert";
  is_premium?: boolean;
  avatar?: string;
  stats?: {
    height?: number;
    weight?: number;
    torsoLength?: number;
    apparelSize?: string;
    gender?: 'male' | 'female' | 'other' | string;
    treksCompleted?: number;
    totalDistance?: number;
    totalElevation?: number;
    configsShared?: number;
  };
}

export const MOCK_USER: User = {
  id: "user-001",
  username: "Thomas",
  email: "thomas@yeti.app",
  role: "user",
  level: 3,
  experience: "intermediate",
  is_premium: true,
  stats: {
    height: 180,
    weight: 75,
    torsoLength: 52,
    apparelSize: 'L',
    gender: 'male',
    treksCompleted: 5,
    totalDistance: 120,
    totalElevation: 4500,
    configsShared: 2
  }
};
