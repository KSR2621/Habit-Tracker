
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HabitMatrix } from './components/HabitMatrix.tsx';
import { SetupView } from './components/SetupView.tsx';
import { AnnualGoalsView } from './components/AnnualGoalsView.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthView } from './components/AuthView.tsx';
import { PaymentGate } from './components/PaymentGate.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CreateHabitModal } from './components/CreateHabitModal.tsx';
import { INITIAL_HABITS, MONTHLY_GOALS, ANNUAL_CATEGORIES, INITIAL_WEEKLY_GOALS, MONTHS_LIST } from './constants.tsx';
import { auth, db } from './services/firebase.ts';
import { Habit, Tab, MonthlyGoal, AnnualCategory, PlannerConfig, WeeklyGoal } from './types.ts';

const ADMIN_EMAIL = 'admin@nextyou21.io';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<'pending' | 'approved' | 'blocked' | null>(null);
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [initialTabSet, setInitialTabSet] = useState(false);
  
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('habitos_has_started') === 'true';
  });
  
  const [activeTab, setActiveTab] = useState<Tab>('Setup');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragCurrentIndex, setDragCurrentIndex] = useState<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const isDragging = useRef(false);

  // App State
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>(MONTHLY_GOALS);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>(INITIAL_WEEKLY_GOALS);
  const [annualCategories, setAnnualCategories] = useState<AnnualCategory[]>(ANNUAL_CATEGORIES);
  const [config, setConfig] = useState<PlannerConfig>({
    year: '2026',
    showVisionBoard: true,
    activeMonths: ['January'],
    manifestationText: "Write your strategic vision here. Manifest the elite architecture of your future life.",
    tabOrder: ['Setup', 'Annual Goals', 'January'],
  });

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isDummyData = habits.length > 0 && habits[0].id === '1' && habits[0].name === INITIAL_HABITS[0].name;

  const allTabs = useMemo(() => {
    const available = ['Setup'];
    if (config.showVisionBoard) available.push('Annual Goals');
    (config.activeMonths || []).forEach(m => available.push(m));
    if (isAdmin) available.push('Admin Control');
    
    let baseOrder = config.tabOrder || [];
    baseOrder = baseOrder.filter(t => t !== 'Architecture');

    if (baseOrder.length > 0) {
      const order = baseOrder.filter(t => available.includes(t));
      const remaining = available.filter(t => !order.includes(t));
      const fullList = [...order, ...remaining];
      if (isDragging.current && dragIndex !== null && dragCurrentIndex !== null) {
        const liveOrder = [...fullList];
        const [removed] = liveOrder.splice(dragIndex, 1);
        liveOrder.splice(dragCurrentIndex, 0, removed);
        return liveOrder;
      }
      return fullList;
    }
    return available;
  }, [config.tabOrder, config.showVisionBoard, config.activeMonths, isAdmin, dragIndex, dragCurrentIndex]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setPermissionError(false);
        setDataLoaded(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || authLoading) return;
    
    let unsubscribe: () => void;
    const setupListener = () => {
      const docRef = db.collection('users').doc(user.uid);
      unsubscribe = docRef.onSnapshot((doc) => {
        setPermissionError(false);
        if (doc.exists) {
          const data = doc.data();
          if (data) {
            let currentStatus = data.status || 'pending';
            const cloudValidUntil = data.validUntil;
            
            if (currentStatus === 'approved' && cloudValidUntil) {
              if (new Date(cloudValidUntil) < new Date()) {
                currentStatus = 'pending';
                db.collection('users').doc(user.uid).update({ status: 'pending', validUntil: null });
              }
            }

            setUserStatus(currentStatus);
            setValidUntil(cloudValidUntil || null);
            setIsPaid(data.isPaid === true);
            
            if (data.createdAt) setUserCreatedAt(data.createdAt);
            if (data.habits && data.habits.length > 0) setHabits(data.habits);
            if (data.monthlyGoals) setMonthlyGoals(data.monthlyGoals);
            if (data.weeklyGoals) setWeeklyGoals(data.weeklyGoals);
            if (data.annualCategories) setAnnualCategories(data.annualCategories);
            if (data.config) {
               const cloudConfig = { ...data.config };
               if (cloudConfig.tabOrder) {
                 cloudConfig.tabOrder = cloudConfig.tabOrder.filter((t: string) => t !== 'Architecture');
               }
               setConfig(prev => ({ ...prev, ...cloudConfig }));
            }
          }
        } else {
          setDataLoaded(true);
        }
        setDataLoaded(true);
      }, (error) => {
        console.warn("Firestore Sync Error:", error);
        if (error.code === 'permission-denied') {
          setPermissionError(true);
          setTimeout(() => setupListener(), 3000);
        }
        setDataLoaded(true);
      });
    };

    setupListener();
    return () => unsubscribe && unsubscribe();
  }, [user, authLoading]);

  useEffect(() => {
    if (dataLoaded && !initialTabSet && allTabs.length > 0) {
      setActiveTab(allTabs[0]);
      setInitialTabSet(true);
    }
  }, [dataLoaded, initialTabSet, allTabs]);

  const syncToCloud = async (updates: any) => {
    if (!user || permissionError) return;
    setSyncing(true);
    try {
      await db.collection('users').doc(user.uid).update(updates);
    } catch (e) {
      await db.collection('users').doc(user.uid).set(updates, { merge: true });
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setInitialTabSet(false);
    setHasStarted(false);
    localStorage.removeItem('habitos_has_started');
  };

  const handleDragStart = (index: number) => {
    longPressTimer.current = window.setTimeout(() => {
      isDragging.current = true;
      setDragIndex(index);
      setDragCurrentIndex(index);
    }, 400);
  };

  const handleDragOver = (index: number) => {
    if (isDragging.current && dragIndex !== null && dragCurrentIndex !== index) {
      setDragCurrentIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (isDragging.current && dragIndex !== null && dragCurrentIndex !== null && dragIndex !== dragCurrentIndex) {
      const newTabs = [...allTabs];
      setConfig(prev => ({ ...prev, tabOrder: newTabs }));
      syncToCloud({ config: { ...config, tabOrder: newTabs } });
    }
    isDragging.current = false;
    setDragIndex(null);
    setDragCurrentIndex(null);
  };

  const subscriptionRemaining = useMemo(() => {
    if (!validUntil) return 0;
    const diff = new Date(validUntil).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [validUntil]);

  const renderContent = () => {
    if (isAdmin) return <AdminPage />;

    if (permissionError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-700">
          <div className="w-20 h-20 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 text-3xl shadow-xl">⚙️</div>
          <div className="max-w-md">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">Sync Required.</h2>
            <p className="text-slate-500 font-medium mt-4 italic leading-relaxed text-sm">"The Nexus cloud requires updated security rules. Ensure your Firestore rules allow access for authenticated architects."</p>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg">Retry Handshake</button>
            <button onClick={handleLogout} className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px]">Disconnect Protocol</button>
          </div>
        </div>
      );
    }

    if (userStatus === 'blocked') {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-rose-100 rounded-[3rem] flex items-center justify-center text-rose-600 text-5xl shadow-xl">🚫</div>
          <div className="max-w-xl px-6">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Access Denied.</h2>
            <p className="text-slate-500 font-medium mt-6 italic leading-relaxed text-sm md:text-base">"Your architectural ledger has been suspended due to protocol violations. Your session remains logged in for administrative identification."</p>
          </div>
          <button onClick={handleLogout} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:bg-rose-600 transition-all">Sign Out Protocol</button>
        </div>
      );
    }

    if (!isPaid) {
      return <PaymentGate userId={user.uid} userEmail={user.email} onSuccess={() => setIsPaid(true)} />;
    }

    if (userStatus === 'pending') {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-amber-50 rounded-[3rem] flex items-center justify-center text-amber-500 text-5xl shadow-xl animate-float">⏳</div>
          <div className="max-w-xl px-6">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Verification.</h2>
            <p className="text-slate-500 font-medium mt-6 italic leading-relaxed text-sm md:text-base">"Payment logged. Authorization in progress. Your identity remains active while the system calibrates your clearance."</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[9px]">Refresh Status</button>
             <button onClick={handleLogout} className="px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[9px]">Sign Out</button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'Setup':
        return (
          <SetupView 
            isDummyData={isDummyData}
            onClearDummyData={() => {
              setHabits([]); setMonthlyGoals([]); setAnnualCategories([]); setWeeklyGoals([]);
              syncToCloud({ habits: [], monthlyGoals: [], annualCategories: [], weeklyGoals: [] });
            }}
            habits={habits} 
            onUpdateHabit={(id, updates) => {
              const newHabits = habits.map(h => h.id === id ? { ...h, ...updates } : h);
              setHabits(newHabits); syncToCloud({ habits: newHabits });
            }}
            onDeleteHabit={(id) => {
              const newHabits = habits.filter(h => h.id !== id);
              setHabits(newHabits); syncToCloud({ habits: newHabits });
            }}
            onAddHabit={() => setIsAddModalOpen(true)}
            monthlyGoals={monthlyGoals}
            onUpdateMonthlyGoals={(month, goals) => {
              // UPSERT Logic: Handle case where month container doesn't exist in monthlyGoals array yet
              const monthExists = monthlyGoals.some(m => m.month === month);
              let newGoals;
              if (monthExists) {
                newGoals = monthlyGoals.map(m => m.month === month ? { ...m, goals } : m);
              } else {
                newGoals = [...monthlyGoals, { month, goals }];
              }
              setMonthlyGoals(newGoals); 
              syncToCloud({ monthlyGoals: newGoals });
            }}
            onAddMonthlyGoalContainer={(month) => {
              const newGoals = [...monthlyGoals, { month, goals: [] }];
              setMonthlyGoals(newGoals); syncToCloud({ monthlyGoals: newGoals });
            }}
            onDeleteMonthlyGoalContainer={(month) => {
              const newGoals = monthlyGoals.filter(m => m.month !== month);
              setMonthlyGoals(newGoals); syncToCloud({ monthlyGoals: newGoals });
            }}
            config={config}
            onUpdateConfig={(newConf) => {
              setConfig(newConf); syncToCloud({ config: newConf });
            }}
            subscriptionRemaining={subscriptionRemaining}
            allTabs={allTabs}
          />
        );
      case 'Annual Goals':
        return (
          <AnnualGoalsView 
            year={config.year}
            categories={annualCategories} 
            onUpdateCategory={(index, updates) => {
              const newCats = annualCategories.map((c, i) => i === index ? { ...c, ...updates } : c);
              setAnnualCategories(newCats); syncToCloud({ annualCategories: newCats });
            }}
            onAddCategory={() => {
              const newCats = [...annualCategories, { name: 'New Category', goals: [] }];
              setAnnualCategories(newCats); syncToCloud({ annualCategories: newCats });
            }}
            onDeleteCategory={(index) => {
              const newCats = annualCategories.filter((_, i) => i !== index);
              setAnnualCategories(newCats); syncToCloud({ annualCategories: newCats });
            }}
            weeklyGoals={weeklyGoals}
            onUpdateWeeklyGoals={(month, weekIndex, goals) => {
              const existingIdx = weeklyGoals.findIndex(w => w.month === month && w.weekIndex === weekIndex);
              let newWeekly;
              if (existingIdx > -1) {
                newWeekly = [...weeklyGoals];
                newWeekly[existingIdx] = { ...newWeekly[existingIdx], goals };
              } else {
                newWeekly = [...weeklyGoals, { month, weekIndex, goals }];
              }
              setWeeklyGoals(newWeekly); syncToCloud({ weeklyGoals: newWeekly });
            }}
          />
        );
      default:
        if (MONTHS_LIST.includes(activeTab)) {
          return (
            <HabitMatrix 
              month={activeTab} year={config.year} habits={habits} weeklyGoals={weeklyGoals.filter(w => w.month === activeTab)}
              onUpdateWeeklyGoalStatus={(weekIdx, goalIdx, completed) => {
                const week = weeklyGoals.find(w => w.month === activeTab && w.weekIndex === weekIdx);
                if (week) {
                  const newGs = [...week.goals]; newGs[goalIdx].completed = completed;
                  const newW = weeklyGoals.map(w => (w.month === activeTab && w.weekIndex === weekIdx) ? { ...w, goals: newGs } : w);
                  setWeeklyGoals(newW); syncToCloud({ weeklyGoals: newW });
                }
              }}
              onToggleCell={(id, day) => {
                const newHabits = habits.map(h => {
                  if (h.id === id) {
                    const mHist = h.history[activeTab] || {};
                    const newHist = { ...mHist, [day]: !mHist[day] };
                    return { ...h, history: { ...h.history, [activeTab]: newHist } };
                  }
                  return h;
                });
                setHabits(newHabits); syncToCloud({ habits: newHabits });
              }} 
            />
          );
        }
        return <div className="p-20 text-center font-bold text-gray-400">Ledger Sector Missing.</div>;
    }
  };

  const getTabTheme = (tab: string) => {
    if (tab === 'Admin Control') return 'bg-rose-600 text-white';
    if (tab === 'Setup') return 'bg-slate-800 text-white';
    if (tab === 'Annual Goals') return 'bg-[#76C7C0] text-white';
    const monthIdx = MONTHS_LIST.indexOf(tab);
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-amber-500', 'bg-emerald-600', 'bg-rose-600', 'bg-sky-500', 'bg-violet-600', 'bg-orange-600', 'bg-teal-600', 'bg-pink-600', 'bg-indigo-700', 'bg-cyan-600'];
    return monthIdx !== -1 ? colors[monthIdx % colors.length] : 'bg-slate-200 text-slate-600';
  };

  if (authLoading) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-300 font-black tracking-widest animate-pulse">BOOTING...</div>;

  if (!user) {
    if (!hasStarted) return <LandingPage onStart={() => { setHasStarted(true); localStorage.setItem('habitos_has_started', 'true'); }} />;
    return <AuthView onSuccess={() => {}} onBack={() => { setHasStarted(false); localStorage.removeItem('habitos_has_started'); }} />;
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="planner-container">
        <header className="relative flex flex-col md:flex-row justify-between items-center md:items-end mb-8 md:mb-12 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-sm gap-6 overflow-hidden">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-900 rounded-xl md:rounded-[1.8rem] flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl animate-float">N</div>
            <div>
              <h1 className="text-3xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none">{config.year} NextYou21</h1>
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-1 md:mt-2">Life Architecture Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
             <div className="text-right hidden sm:block">
               <div className={`inline-flex items-center gap-2 ${syncing ? 'bg-amber-400' : 'bg-[#76C7C0]'} text-white px-5 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl transition-all`}>
                 <div className={`w-1.5 h-1.5 rounded-full bg-white ${syncing ? 'animate-ping' : ''}`} />
                 {syncing ? 'Syncing...' : 'Synced'}
               </div>
               <p className="text-[10px] md:text-[11px] font-black text-slate-400 mt-1 md:mt-2 uppercase">{user.displayName || user.email}</p>
             </div>
             <button onClick={handleLogout} className="p-3 md:p-4 bg-white border border-slate-200 rounded-xl md:rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-600 transition-all shadow-xl group flex items-center gap-2">
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden md:block">Logout</span>
               <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
             </button>
          </div>
        </header>

        <main className="min-h-[50vh]">{renderContent()}</main>

        {(isPaid && userStatus === 'approved' && !permissionError) && (
          <nav 
            className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-[60] px-4 md:px-6 flex items-end h-[60px] md:h-[68px] overflow-x-auto no-scrollbar shadow-xl select-none"
            onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd} onTouchEnd={handleDragEnd}
          >
            <div className="flex items-end h-full gap-1 relative min-w-full">
              {allTabs.map((tab, idx) => (
                <button
                  key={`${tab}-${idx}`} onMouseDown={() => handleDragStart(idx)} onTouchStart={() => handleDragStart(idx)} onMouseEnter={() => handleDragOver(idx)}
                  onClick={() => !isDragging.current && setActiveTab(tab)}
                  className={`relative px-4 md:px-6 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap ${activeTab === tab ? `${getTabTheme(tab)} rounded-t-lg md:rounded-t-xl scale-y-105 origin-bottom shadow-lg z-10` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
                  style={{ transform: dragIndex === idx ? 'translateY(-12px)' : undefined, opacity: dragIndex === idx ? 0.3 : 1 }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </nav>
        )}

        {isAddModalOpen && (
          <CreateHabitModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSubmit={(data) => {
              const newH: Habit = { ...data, id: Math.random().toString(36).substr(2, 9), completed: false, streak: 0, history: {} };
              const newHabits = [...habits, newH]; setHabits(newHabits); syncToCloud({ habits: newHabits });
              setIsAddModalOpen(false);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
