
import React, { useState, useEffect } from 'react';
import { HabitMatrix } from './components/HabitMatrix.tsx';
import { SetupView } from './components/SetupView.tsx';
import { AnnualGoalsView } from './components/AnnualGoalsView.tsx';
import { Dashboard as MainDashboard } from './pages/Dashboard.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthView } from './components/AuthView.tsx';
import { PaymentGate } from './components/PaymentGate.tsx';
import { CreateHabitModal } from './components/CreateHabitModal.tsx';
import { INITIAL_HABITS, MONTHLY_GOALS, ANNUAL_CATEGORIES, MONTHS_LIST } from './constants.tsx';
import { auth, db } from './services/firebase.ts';
import { Habit, Tab, MonthlyGoal, AnnualCategory, PlannerConfig, WeeklyGoal } from './types.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(true); // Default to true for old users, snapshot will correct for new users
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('habitos_has_started') === 'true';
  });
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // App State
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>(MONTHLY_GOALS);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [annualCategories, setAnnualCategories] = useState<AnnualCategory[]>(ANNUAL_CATEGORIES);
  const [config, setConfig] = useState<PlannerConfig>({
    year: '2026',
    showVisionBoard: true,
    activeMonths: ['January'],
    manifestationText: "Write your strategic vision here. Manifest the elite architecture of your future life.",
  });

  // Check if we are showing dummy data
  const isDummyData = habits.length > 0 && habits[0].id === '1' && habits[0].name === INITIAL_HABITS[0].name;

  // Listen for Auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync data from Firestore
  useEffect(() => {
    if (!user) return;
    const docRef = db.collection('users').doc(user.uid);
    const unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          // Only enforce payment if the flag is explicitly set to false (new user flow)
          // If the flag is missing, it's an old user account - allow interaction.
          if (data.isPaid !== undefined) {
            setIsPaid(data.isPaid);
          } else {
            setIsPaid(true); // Grandfathering old users
          }
          
          if (data.createdAt) setUserCreatedAt(data.createdAt);
          if (data.habits && data.habits.length > 0) setHabits(data.habits);
          if (data.monthlyGoals) setMonthlyGoals(data.monthlyGoals);
          if (data.weeklyGoals) setWeeklyGoals(data.weeklyGoals);
          if (data.annualCategories) setAnnualCategories(data.annualCategories);
          if (data.config) setConfig(prev => ({ ...prev, ...data.config }));
        }
      } else {
        // If document doesn't exist, we'll wait for the auth flow to create it.
        // During registration, the doc is created with isPaid: false.
      }
    });
    return () => unsubscribe();
  }, [user]);

  const syncToCloud = async (updates: any) => {
    if (!user) return;
    setSyncing(true);
    try {
      await db.collection('users').doc(user.uid).update(updates);
    } catch (e) {
      console.error("Sync Error:", e);
    } finally {
      setSyncing(false);
    }
  };

  const updateHabits = (newHabits: Habit[] | ((prev: Habit[]) => Habit[])) => {
    setHabits((prev) => {
      const updated = typeof newHabits === 'function' ? newHabits(prev) : newHabits;
      syncToCloud({ habits: updated });
      return updated;
    });
  };

  const toggleHabitCell = (habitId: string, day: number, month: string) => {
    updateHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const monthHistory = h.history[month] || {};
        const newHistory = { ...monthHistory, [day]: !monthHistory[day] };
        return { ...h, history: { ...h.history, [month]: newHistory } };
      }
      return h;
    }));
  };

  const handleClearDummyData = () => {
    if (confirm("Are you sure you want to purge all initial mock architecture? This will delete all demo habits, goals, and milestones.")) {
      setHabits([]);
      setMonthlyGoals([]);
      setAnnualCategories([]);
      setWeeklyGoals([]);
      syncToCloud({
        habits: [],
        monthlyGoals: [],
        annualCategories: [],
        weeklyGoals: []
      });
      setDismissedWarning(true);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setIsPaid(true); // Reset to default for next potential login
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    syncToCloud({ isPaid: true });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Setup':
        return (
          <SetupView 
            isDummyData={isDummyData}
            onClearDummyData={handleClearDummyData}
            habits={habits} 
            onUpdateHabit={(id, updates) => updateHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h))}
            onDeleteHabit={(id) => updateHabits(habits.filter(h => h.id !== id))}
            onAddHabit={() => setIsAddModalOpen(true)}
            monthlyGoals={monthlyGoals}
            onUpdateMonthlyGoals={(month, goals) => {
              const newGoals = monthlyGoals.map(m => m.month === month ? { ...m, goals } : m);
              setMonthlyGoals(newGoals);
              syncToCloud({ monthlyGoals: newGoals });
            }}
            onAddMonthlyGoalContainer={(month) => {
              if (monthlyGoals.find(m => m.month === month)) return;
              const newGoals = [...monthlyGoals, { month, goals: [{ text: 'New Target', completed: false }] }];
              setMonthlyGoals(newGoals);
              syncToCloud({ monthlyGoals: newGoals });
            }}
            onDeleteMonthlyGoalContainer={(month) => {
              const newGoals = monthlyGoals.filter(m => m.month !== month);
              setMonthlyGoals(newGoals);
              syncToCloud({ monthlyGoals: newGoals });
            }}
            config={config}
            onUpdateConfig={(newConf) => {
              setConfig(newConf);
              syncToCloud({ config: newConf });
            }}
          />
        );
      case 'Annual Goals':
        return (
          <AnnualGoalsView 
            year={config.year}
            categories={annualCategories} 
            onUpdateCategory={(index, updates) => {
              const newCats = annualCategories.map((c, i) => i === index ? { ...c, ...updates } : c);
              setAnnualCategories(newCats);
              syncToCloud({ annualCategories: newCats });
            }}
            onAddCategory={() => {
              const newCats = [...annualCategories, { name: 'New Category', goals: [{ text: 'First Milestone', completed: false }] }];
              setAnnualCategories(newCats);
              syncToCloud({ annualCategories: newCats });
            }}
            onDeleteCategory={(index) => {
              const newCats = annualCategories.filter((_, i) => i !== index);
              setAnnualCategories(newCats);
              syncToCloud({ annualCategories: newCats });
            }}
            weeklyGoals={weeklyGoals}
            onUpdateWeeklyGoals={(month, weekIndex, goals) => {
              const existing = weeklyGoals.find(w => w.month === month && w.weekIndex === weekIndex);
              let newWeekly;
              if (existing) {
                newWeekly = weeklyGoals.map(w => (w.month === month && w.weekIndex === weekIndex) ? { ...w, goals } : w);
              } else {
                newWeekly = [...weeklyGoals, { month, weekIndex, goals }];
              }
              setWeeklyGoals(newWeekly);
              syncToCloud({ weeklyGoals: newWeekly });
            }}
          />
        );
      case 'Dashboard':
        return (
          <MainDashboard 
            habits={habits} 
            config={config}
            userCreatedAt={userCreatedAt}
            userEmail={user?.email}
            onUpdateConfig={(newConf) => {
              setConfig(newConf);
              syncToCloud({ config: newConf });
            }}
            onAddClick={() => setIsAddModalOpen(true)} 
          />
        );
      default:
        if (MONTHS_LIST.includes(activeTab as string)) {
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
                  const newWeekly = weeklyGoals.map(w => (w.month === activeTab && w.weekIndex === weekIdx) ? { ...w, goals: newGoals } : w);
                  setWeeklyGoals(newWeekly);
                  syncToCloud({ weeklyGoals: newWeekly });
                }
              }}
              onToggleCell={(id, day) => toggleHabitCell(id, day, activeTab)} 
            />
          );
        }
        return <div className="p-20 text-center font-bold text-gray-400">Section not found.</div>;
    }
  };

  if (authLoading) return null;

  if (!hasStarted) return <LandingPage onStart={() => {
    localStorage.setItem('habitos_has_started', 'true');
    setHasStarted(true);
  }} />;
  
  if (!user) return <AuthView onSuccess={() => {}} onBack={() => {
    localStorage.removeItem('habitos_has_started');
    setHasStarted(false);
  }} />;

  if (!isPaid) return <PaymentGate userEmail={user.email} onSuccess={handlePaymentSuccess} />;

  // Define the chronological list of tabs
  const mainTabs = ['Dashboard', 'Setup'];
  if (config.showVisionBoard) mainTabs.push('Annual Goals');
  const monthTabs = config.activeMonths || [];
  const allTabs = [...mainTabs, ...monthTabs];

  return (
    <div className="min-h-screen pb-32">
      {/* Operational Advisory Banner */}
      {isDummyData && !dismissedWarning && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-6 md:px-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              </div>
              <p className="text-[10px] md:text-[11px] font-black text-amber-900 uppercase tracking-[0.2em] leading-relaxed text-center md:text-left">
                Operational Advisory: System is utilizing architectural mock data. Initialize your private performance ledger in the <span className="text-emerald-700 underline decoration-2 underline-offset-4 font-black">Setup tab</span> to begin execution.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { setActiveTab('Setup'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-[10px] font-black text-emerald-700 hover:text-emerald-900 uppercase tracking-widest border-b-2 border-emerald-200 transition-all pb-0.5"
              >
                Configure Setup
              </button>
              <button 
                onClick={() => setDismissedWarning(true)}
                className="text-amber-400 hover:text-amber-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="planner-container">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-gray-200 gap-6">
          <div>
            <h1 className="text-6xl font-handwritten text-[#374151]">{config.year} NextYou21</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">Life Architecture Command</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
               <div className={`flex items-center gap-2 ${syncing ? 'bg-amber-400' : 'bg-[#76C7C0]'} text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all duration-300`}>
                 {syncing ? 'Syncing Cloud...' : 'Ledger Connected'}
               </div>
               <p className="text-[10px] font-black text-gray-400 mt-2">{user?.displayName}</p>
             </div>
             <button onClick={handleLogout} className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm">
               <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
             </button>
          </div>
        </header>

        {renderContent()}

        {isAddModalOpen && (
          <CreateHabitModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSubmit={(data) => {
              const newHabit: Habit = { ...data, id: Math.random().toString(36).substr(2, 9), completed: false, streak: 0, history: {} };
              updateHabits([...habits, newHabit]);
              setIsAddModalOpen(false);
            }} 
          />
        )}

        {/* Linear Chronological Spreadsheet-style Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#E2E4E7] border-t border-gray-400 z-[60] py-0 px-4 flex items-end h-[46px] overflow-x-auto no-scrollbar shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex items-end h-full">
            {allTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
              >
                {tab} 
              </button>
            ))}
          </div>
          <div className="flex-1 border-b border-gray-400 mb-[-1px]"></div>
        </nav>
      </div>
    </div>
  );
};

export default App;
