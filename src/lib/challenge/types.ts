export type CompanyMemberRow = {
  id: string;
  user_id: string;
  company_id: string;
  role: "user" | "admin";
  created_at: string;
};

export type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ChallengeRow = {
  id: string;
  company_id: string;
  name: string;
  level: number;
  start_date: string;
  end_date: string;
  duration_days: number;
  movement_goal: number;
  photos_per_day: number;
  lessons_per_day: number;
  meditation_required: boolean;
  gratitude_required: boolean;
};

export type DailyLogRow = {
  id: string;
  user_id: string;
  company_id: string;
  date: string;
  movement_reps: number;
  movement_points: number;
  movement_bonus_points: number;
  nutrition_photo_url: string | null;
  nutrition_points: number;
  nutrition_bonus_points: number;
  lesson_completed: boolean;
  lesson_points: number;
  meditation_completed: boolean;
  meditation_points: number;
  gratitude_text: string | null;
  gratitude_points: number;
  notes: string | null;
  total_points: number | null;
  created_at: string;
  updated_at: string;
};

export type NutritionLogRow = {
  id: string;
  user_id: string;
  company_id: string;
  date: string;
  photo_url: string;
  points: number;
  bonus_points: number;
  created_at: string;
};

export type UserStreakRow = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  company_id: string | null;
  name: string | null;
  age: number | null;
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  goal: string | null;
  food_preferences: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  total_points: number;
};
