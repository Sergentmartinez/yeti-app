export interface User {
  id: string;
  name: string;
  email: string;
  experience: "beginner" | "intermediate" | "advanced" | "expert";
  is_premium: boolean;
}

export const MOCK_USER: User = {
  id: "user-001",
  name: "Marco",
  email: "marco@yeti.app",
  experience: "advanced",
  is_premium: true,
};
