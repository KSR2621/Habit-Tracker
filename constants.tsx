
import { Habit, MonthlyGoal, AnnualCategory, HabitTemplate, WeeklyGoal } from './types';

export const MONTHS_LIST = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const generateHistory = (probability: number) => {
  const history: Record<number, boolean> = {};
  for (let i = 1; i <= 31; i++) {
    history[i] = Math.random() < probability;
  }
  return history;
};

const initialMonth = "January";

export const INITIAL_HABITS: Habit[] = [
  { id: '1', name: 'Deep Work Protocol (90m)', emoji: '💻', completed: true, streak: 5, difficulty: 'Hard', category: 'Work', history: { [initialMonth]: generateHistory(0.7) }, activeMonths: [...MONTHS_LIST], goal: 31, frequency: '7/7' },
  { id: '2', name: 'Strategic Portfolio Review', emoji: '💰', completed: true, streak: 12, difficulty: 'Medium', category: 'Work', history: { [initialMonth]: generateHistory(0.9) }, activeMonths: [...MONTHS_LIST], goal: 4, frequency: '1/7' },
  { id: '3', name: 'Cold Exposure Therapy', emoji: '❄️', completed: false, streak: 8, difficulty: 'Hard', category: 'Body', history: { [initialMonth]: generateHistory(0.4) }, activeMonths: [...MONTHS_LIST], goal: 31, frequency: '7/7' },
  { id: '4', name: 'Zero-Distraction Reading', emoji: '📚', completed: true, streak: 20, difficulty: 'Medium', category: 'Mind', history: { [initialMonth]: generateHistory(0.6) }, activeMonths: [...MONTHS_LIST], goal: 31, frequency: '7/7' },
];

export const MONTHLY_GOALS: MonthlyGoal[] = [
  { month: 'January', goals: [{ text: 'Q1 Strategy Finalized', completed: true }, { text: 'Reserve ₹100k Capital', completed: true }, { text: 'Audit Operational Leaks', completed: false }] },
  { month: 'February', goals: [{ text: 'Launch Alpha Protocol', completed: false }, { text: 'Master Prompt Engineering', completed: false }] },
];

export const ANNUAL_CATEGORIES: AnnualCategory[] = [
  { 
    name: 'Wealth Architecture', 
    icon: '💰',
    goals: [
      { text: 'Achieve ₹5M in Liquid Assets', completed: false },
      { text: 'Scale Passive Revenue to ₹200k/mo', completed: false },
      { text: 'Optimize Tax Strategy (Elite Tier)', completed: true }
    ] 
  },
  { 
    name: 'Business Legacy', 
    icon: '🏛️',
    goals: [
      { text: 'Launch Global V2 Platform', completed: false },
      { text: 'Acquire 10 High-Value Retainers', completed: true },
      { text: 'Automate 80% of Core Operations', completed: false }
    ] 
  },
  { 
    name: 'High-Performance Body', 
    icon: '🧬',
    goals: [
      { text: 'Sub-12% Body Fat Composition', completed: true },
      { text: 'Complete Full Triathlon Circuit', completed: false },
      { text: 'Perfect 95% Sleep Fidelity (8h)', completed: false }
    ] 
  },
];

export const INITIAL_WEEKLY_GOALS: WeeklyGoal[] = [
  {
    month: 'January',
    weekIndex: 0,
    goals: [
      { text: 'Finalize 2026 Core Manifesto', completed: true },
      { text: 'Audit Portfolio Risk Vectors', completed: true }
    ]
  },
  {
    month: 'January',
    weekIndex: 1,
    goals: [
      { text: 'Secure High-Impact Q1 Retainer', completed: true },
      { text: 'Bio-Sync: 7-Day Sugar Fast', completed: true }
    ]
  }
];

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 't1',
    title: 'Sunrise Protocol',
    description: 'A collection of high-impact morning rituals to start your day.',
    icon: '☀️',
    color: 'from-orange-400 to-red-500',
    rituals: [
      { name: 'Cold Shower', emoji: '🚿', category: 'Body', difficulty: 'Hard', goal: 31, frequency: '7/7' },
      { name: 'Morning Sun', emoji: '☀️', category: 'Body', difficulty: 'Easy', goal: 31, frequency: '7/7' },
    ]
  }
];
