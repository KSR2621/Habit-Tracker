
export type Tab = 'Setup' | 'Annual Goals' | 'Admin Control' | string;

export type HabitMode = 'All' | 'Focus' | 'Low Energy' | 'Growth';

export interface HabitHistory {
  [day: number]: boolean;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  completed: boolean; 
  streak: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Mind' | 'Body' | 'Spirit' | 'Work';
  history: Record<string, HabitHistory>;
  activeMonths: string[]; 
  goal: number;
  frequency: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number; // 0-100
  planType: 'tactical' | 'strategic' | 'all';
  active: boolean;
  createdAt: string;
}

export interface HabitTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  rituals: {
    name: string;
    emoji: string;
    category: Habit['category'];
    difficulty: Habit['difficulty'];
    goal: number;
    frequency: string;
  }[];
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface MonthlyGoalItem {
  text: string;
  completed: boolean;
}

export interface MonthlyGoal {
  month: string;
  goals: MonthlyGoalItem[];
}

export interface WeeklyGoal {
  month: string;
  weekIndex: number;
  goals: { text: string; completed: boolean }[];
}

export interface AnnualCategory {
  name: string;
  icon?: string;
  color?: string;
  goals: { text: string; completed: boolean }[];
}

export interface PlannerConfig {
  year: string;
  showVisionBoard: boolean;
  activeMonths: string[];
  manifestationText?: string;
  tabOrder?: string[];
}
