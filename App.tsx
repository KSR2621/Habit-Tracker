
import React, { useState, useEffect } from 'react';
import { HabitMatrix } from './components/HabitMatrix';
import { SetupView } from './components/SetupView';
import { AnnualGoalsView } from './components/AnnualGoalsView';
import { DashboardView } from './components/DashboardView';
import { INITIAL_HABITS, MONTHLY_GOALS, ANNUAL_CATEGORIES } from './constants';
import { Habit, Tab, MonthlyGoal, AnnualCategory, PlannerConfig, WeeklyGoal } from './types';

// Storage Keys
const STORAGE_KEYS = {
  HABITS: 'habitos_habits_v1',
  MONTHLY_GOALS: 'habitos_monthly_goals_v1',
  WEEKLY_GOALS: 'habitos_weekly_goals_v1',
  ANNUAL_CATEGORIES: 'habitos_annual_categories_v1',
  CONFIG: 'habitos_config_v1',
};

const App: React.FC = () => {
  // Persistence Helper
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(`Error parsing storage for ${key}`, e);
      }
    }
    return defaultValue;
  };

  const [habits, setHabits] = useState<Habit[]>(() => getInitialState(STORAGE_KEYS.HABITS, INITIAL_HABITS));
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>(() => getInitialState(STORAGE_KEYS.MONTHLY_GOALS, MONTHLY_GOALS));
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>(() => getInitialState(STORAGE_KEYS.WEEKLY_GOALS, []));
  const [annualCategories, setAnnualCategories] = useState<AnnualCategory[]>(() => getInitialState(STORAGE_KEYS.ANNUAL_CATEGORIES, ANNUAL_CATEGORIES));
  const [config, setConfig] = useState<PlannerConfig>(() => getInitialState(STORAGE_KEYS.CONFIG, {
    year: '2026',
    showVisionBoard: true,
    activeMonths: ['January'],
  }));
  const [activeTab, setActiveTab] = useState<Tab>('January');

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_GOALS, JSON.stringify(monthlyGoals));
  }, [monthlyGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_GOALS, JSON.stringify(weeklyGoals));
  }, [weeklyGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNUAL_CATEGORIES, JSON.stringify(annualCategories));
  }, [annualCategories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    document.title = `${config.year} Habit Tracker - Strategic Architecture`;
  }, [config]);

  const toggleHabitCell = (habitId: string, day: number, month: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const monthHistory = h.history[month] || {};
        const newHistory = { ...monthHistory, [day]: !monthHistory[day] };
        return { 
          ...h, 
          history: { ...h.history, [month]: newHistory } 
        };
      }
      return h;
    }));
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const addHabit = () => {
    const newHabit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Habit',
      emoji: '✨',
      completed: false,
      streak: 0,
      difficulty: 'Medium',
      category: 'Work',
      history: {}
    };
    setHabits([...habits, newHabit]);
  };

  const updateMonthlyGoals = (month: string, goals: string[]) => {
    setMonthlyGoals(prev => prev.map(m => m.month === month ? { ...m, goals } : m));
  };

  const updateWeeklyGoals = (month: string, weekIndex: number, goals: { text: string; completed: boolean }[]) => {
    setWeeklyGoals(prev => {
      const existing = prev.find(w => w.month === month && w.weekIndex === weekIndex);
      if (existing) {
        return prev.map(w => (w.month === month && w.weekIndex === weekIndex) ? { ...w, goals } : w);
      }
      return [...prev, { month, weekIndex, goals }];
    });
  };

  const addMonthlyGoalContainer = (month: string) => {
    if (monthlyGoals.find(m => m.month === month)) return;
    setMonthlyGoals(prev => [...prev, { month, goals: ['New Target'] }]);
  };

  const deleteMonthlyGoalContainer = (month: string) => {
    setMonthlyGoals(prev => prev.filter(m => m.month !== month));
  };

  const updateAnnualCategory = (index: number, updates: Partial<AnnualCategory>) => {
    setAnnualCategories(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
  };

  const addAnnualCategory = () => {
    setAnnualCategories(prev => [...prev, { name: 'New Category', goals: ['First Milestone'] }]);
  };

  const deleteAnnualCategory = (index: number) => {
    setAnnualCategories(prev => prev.filter((_, i) => i !== index));
  };

  const renderContent = () => {
    if (activeTab === 'Setup') {
      return (
        <SetupView 
          habits={habits} 
          onUpdateHabit={updateHabit}
          onDeleteHabit={deleteHabit}
          onAddHabit={addHabit}
          monthlyGoals={monthlyGoals}
          onUpdateMonthlyGoals={updateMonthlyGoals}
          onAddMonthlyGoalContainer={addMonthlyGoalContainer}
          onDeleteMonthlyGoalContainer={deleteMonthlyGoalContainer}
          config={config}
          onUpdateConfig={setConfig}
        />
      );
    }
    
    if (activeTab === 'Annual Goals' && config.showVisionBoard) {
      return (
        <AnnualGoalsView 
          year={config.year}
          categories={annualCategories} 
          onUpdateCategory={updateAnnualCategory}
          onAddCategory={addAnnualCategory}
          onDeleteCategory={deleteAnnualCategory}
          weeklyGoals={weeklyGoals}
          onUpdateWeeklyGoals={updateWeeklyGoals}
        />
      );
    }

    if (activeTab === 'Dashboard') {
      return (
        <DashboardView 
          habits={habits} 
          currentMonth={config.activeMonths[0] || 'January'} 
          weeklyGoals={weeklyGoals}
          annualCategories={annualCategories}
        />
      );
    }

    if (config.activeMonths.includes(activeTab)) {
      return (
        <HabitMatrix 
          month={activeTab}
          year={config.year}
          habits={habits} 
          weeklyGoals={weeklyGoals.filter(w => w.month === activeTab)}
          onUpdateWeeklyGoalStatus={(weekIdx, goalIdx, completed) => {
            const currentWeek = weeklyGoals.find(w => w.month === activeTab && w.weekIndex === weekIdx);
            if (currentWeek) {
              const newGoals = [...currentWeek.goals];
              newGoals[goalIdx] = { ...newGoals[goalIdx], completed };
              updateWeeklyGoals(activeTab, weekIdx, newGoals);
            }
          }}
          onToggleCell={(id, day) => toggleHabitCell(id, day, activeTab)} 
        />
      );
    }

    return <div className="p-20 text-center font-bold text-gray-400">Section not found. Select a tab below.</div>;
  };

  const availableTabs: Tab[] = [
    'Setup',
    ...(config.showVisionBoard ? ['Annual Goals'] : []),
    ...config.activeMonths,
    'Dashboard'
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="planner-container">
        <div className="flex justify-between items-end mb-10 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-6xl font-handwritten text-[#374151]">{config.year} Habit Tracker</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">
              Strategic Life Architecture & Performance Ledger
            </p>
          </div>
          <div className="text-right">
             <div className="bg-[#76C7C0] text-white px-6 py-2 rounded-sm text-xs font-bold uppercase mb-1">Year of Discipline</div>
             <p className="text-sm font-bold text-gray-600">Active Cycle: {activeTab}</p>
          </div>
        </div>

        {renderContent()}

        <div className="fixed bottom-0 left-0 right-0 bg-[#E5E7EB] border-t border-gray-300 flex items-end px-10 z-50 overflow-x-auto no-scrollbar">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab-button whitespace-nowrap ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-4 py-2 px-4 bg-white/50 rounded-tl-lg border-l border-t border-gray-300">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white text-xl">
               📊
            </div>
            <span className="text-[10px] font-black text-gray-500 uppercase">Architecture Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
