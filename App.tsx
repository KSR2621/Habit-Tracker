import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HabitMatrix } from './components/HabitMatrix.tsx';
import { SetupView } from './components/SetupView.tsx';
import { AnnualGoalsView } from './components/AnnualGoalsView.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthView } from './components/AuthView.tsx';
import { PaymentGate } from './components/PaymentGate.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CreateHabitModal } from './components/CreateHabitModal.tsx';
import { INITIAL_HABITS, MONTHLY_GOALS, ANNUAL_CATEGORIES, MONTHS_LIST } from './constants.tsx';
import { auth, db } from './services/firebase.ts';
import { Habit, Tab, MonthlyGoal, AnnualCategory, PlannerConfig, WeeklyGoal } from './types.ts';

const ADMIN_EMAIL = 'admin@nextyou21.io';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<'pending' | 'approved' | 'blocked' | null>(null);
  const [validUntil, setValidUntil] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initialTabSet, setInitialTabSet] = useState(false);
  
  const [isPaid, setIsPaid] = useState<boolean>(() => {
    return localStorage.getItem('habitos_is_paid') === 'true';
  });

  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('habitos_has_started') === 'true';
  });
  
  const [activeTab, setActiveTab] = useState<Tab>('Setup');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragCurrentIndex, setDragCurrentIndex] = useState<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const isDragging = useRef(false);

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
    tabOrder: ['Setup', 'Annual Goals', 'January'],
  });

  const isAdmin = user?.email === ADMIN_EMAIL;

  const isDummyData = habits.length > 0 && habits[0].id === '1' && habits[0].name === INITIAL_HABITS[0].name;

  // Calculate sorted tabs based on saved tabOrder
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
      if (currentUser) {
        localStorage.setItem('habitos_has_started', 'true');
        setHasStarted(true);
      } else {
        setDataLoaded(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = db.collection('users').doc(user.uid);
    
    const unsubscribe = docRef.onSnapshot((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          // --- TEMPORAL ACCESS CHECK ---
          let currentStatus = data.status || 'pending';
          const cloudValidUntil = data.validUntil;
          
          if (currentStatus === 'approved' && cloudValidUntil) {
            if (new Date(cloudValidUntil) < new Date()) {
              currentStatus = 'pending';
              // Update cloud to reflect automatic expiration
              db.collection('users').doc(user.uid).update({ status: 'pending', validUntil: null });
            }
          }

          setUserStatus(currentStatus);
          setValidUntil(cloudValidUntil || null);

          const cloudPaid = data.isPaid === true;
          
          if (cloudPaid) {
            setIsPaid(true);
            localStorage.setItem('habitos_is_paid', 'true');
          } else if (localStorage.getItem('habitos_is_paid') !== 'true') {
            setIsPaid(false);
          }
          
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
        if (localStorage.getItem('habitos_is_paid') !== 'true') {
          setIsPaid(false);
        }
      }
      setDataLoaded(true);
    }, (error) => {
      console.error("Firestore Listen Error:", error);
      setDataLoaded(true);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (dataLoaded && !initialTabSet && allTabs.length > 0) {
      setActiveTab(allTabs[0]);
      setInitialTabSet(true);
    }
  }, [dataLoaded, initialTabSet, allTabs]);

  const syncToCloud = async (updates: any) => {
    if (!user) return;
    setSyncing(true);
    try {
      await db.collection('users').doc(user.uid).update(updates);
    } catch (e) {
      console.error("Sync Error:", e);
      try {
        await db.collection('users').doc(user.uid).set(updates, { merge: true });
      } catch (innerError) {
        console.error("Final Sync Attempt Failed:", innerError);
      }
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
    if (confirm("Purge mock architecture? This will delete all demo data.")) {
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
    localStorage.removeItem('habitos_has_started');
    setHasStarted(false);
    setInitialTabSet(false);
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    localStorage.setItem('habitos_is_paid', 'true');
    syncToCloud({ isPaid: true });
  };

  const handleDragStart = (index: number) => {
    longPressTimer.current = window.setTimeout(() => {
      isDragging.current = true;
      setDragIndex(index);
      setDragCurrentIndex(index);
      if ('vibrate' in navigator) navigator.vibrate(50);
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

  // Calculate real-time subscription remaining
  const subscriptionRemaining = useMemo(() => {
    if (!validUntil) return 0;
    const expiry = new Date(validUntil);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [validUntil]);

  const renderContent = () => {
    if (userStatus === 'blocked') {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500 rounded-3xl flex items-center justify-center text-white text-4xl shadow-xl shadow-rose-100">🚫</div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">Access Denied.</h2>
            <p className="text-slate-500 font-medium max-w-md mt-4 italic">"Your architectural ledger has been suspended due to protocol violations. Please contact the system administrator for restoration."</p>
          </div>
          <button onClick={handleLogout} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px]">Logout Session</button>
        </div>
      );
    }

    if (userStatus === 'pending' && isPaid) {
      return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
          <div className="w-24 h-24 bg-amber-500 rounded-[3rem] flex items-center justify-center text-white text-4xl shadow-xl animate-float">⏳</div>
          <div className="max-w-xl">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase leading-tight">Verification In Progress.</h2>
            <p className="text-slate-400 font-medium mt-4 italic">"Your payment has been received. Your architectural clearance is currently being processed by the system administrator. Access will be granted shortly."</p>
          </div>
          <div className="flex gap-4">
             <button onClick={() => window.location.reload()} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform">Refresh Status</button>
             <button onClick={handleLogout} className="px-8 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-colors">Sign Out</button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'Admin Control':
        return <AdminPage />;
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
              const finalConf = { ...newConf };
              if (finalConf.tabOrder) {
                finalConf.tabOrder = finalConf.tabOrder.filter(t => t !== 'Architecture');
              }
              setConfig(finalConf);
              syncToCloud({ config: finalConf });
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
                newWeekly = weeklyGoals.map(w => (w.month === month && w.weekIndex === weekIndex) ? { ...w, goals: goals } : w);
              } else {
                newWeekly = [...weeklyGoals, { month, weekIndex, goals }];
              }
              setWeeklyGoals(newWeekly);
              syncToCloud({ weeklyGoals: newWeekly });
            }}
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

  const getTabTheme = (tab: string) => {
    if (tab === 'Admin Control') return 'bg-rose-600 text-white';
    if (tab === 'Setup') return 'bg-slate-800 text-white';
    if (tab === 'Annual Goals') return 'bg-[#76C7C0] text-white';
    
    const monthIdx = MONTHS_LIST.indexOf(tab);
    const colors = [
      'bg-blue-600', 'bg-purple-600', 'bg-amber-500', 'bg-emerald-600', 
      'bg-rose-600', 'bg-sky-500', 'bg-violet-600', 'bg-orange-600', 
      'bg-teal-600', 'bg-pink-600', 'bg-indigo-700', 'bg-cyan-600'
    ];
    
    if (monthIdx !== -1) return colors[monthIdx % colors.length];
    return 'bg-slate-200 text-slate-600';
  };

  const renderLoader = () => (
    <div className="min-h-screen bg-[#FDFDFB] flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white font-black text-3xl animate-pulse shadow-2xl">N</div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Initializing Architecture Console</p>
        <div className="w-48 h-1 bg-gray-100 mt-4 rounded-full overflow-hidden">
          <div className="h-full bg-[#76C7C0] animate-[shimmer_2s_infinite]" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );

  if (authLoading) return renderLoader();

  if (user) {
    if (!dataLoaded && !isPaid) return renderLoader();
    if (dataLoaded && !isPaid) {
      return <PaymentGate userEmail={user.email} onSuccess={handlePaymentSuccess} />;
    }

    return (
      <div className="min-h-screen pb-32">
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
          <header className="relative flex flex-col md:flex-row justify-between items-center md:items-end mb-12 p-8 rounded-[3rem] bg-gradient-to-br from-white to-slate-50 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] gap-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#76C7C0]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-gray-900 rounded-[1.8rem] flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-gray-200 animate-float">N</div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-slate-600 to-[#76C7C0]">
                    {config.year} NextYou21
                  </span>
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-0.5 w-8 bg-[#76C7C0] rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Life Architecture Command</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 relative z-10">
               <div className="text-right hidden sm:block">
                 <div className={`inline-flex items-center gap-2 ${syncing ? 'bg-amber-400 shadow-amber-100' : 'bg-[#76C7C0] shadow-emerald-100'} text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-xl`}>
                   <div className={`w-1.5 h-1.5 rounded-full bg-white ${syncing ? 'animate-ping' : ''}`} />
                   {syncing ? 'Syncing Cloud...' : 'Ledger Connected'}
                 </div>
                 <p className="text-[11px] font-black text-slate-400 mt-2 flex items-center justify-end gap-2 uppercase tracking-tighter">
                   <span className="w-1 h-1 rounded-full bg-slate-300" />
                   {user?.displayName || user?.email?.split('@')[0]}
                 </p>
               </div>
               
               <button 
                 onClick={handleLogout} 
                 className="p-4 bg-white border border-slate-200 rounded-[1.5rem] hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all shadow-xl shadow-slate-100 group flex items-center gap-2"
                 title="Terminate Session"
               >
                 <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Logout</span>
                 <svg className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7" />
                 </svg>
               </button>
            </div>
          </header>

          <main className="min-h-[60vh]">
            {renderContent()}
          </main>

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

          <nav 
            className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-[60] py-0 px-6 flex items-end h-[68px] overflow-x-auto no-scrollbar shadow-[0_-10px_30px_rgba(0,0,0,0.05)] select-none"
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchEnd={handleDragEnd}
          >
            <div className="flex items-end h-full gap-1 relative min-w-full">
              {allTabs.map((tab, idx) => {
                const isActive = activeTab === tab;
                const isBeingDragged = dragIndex === idx;

                return (
                  <button
                    key={`${tab}-${idx}`}
                    onMouseDown={() => handleDragStart(idx)}
                    onTouchStart={() => handleDragStart(idx)}
                    onMouseEnter={() => handleDragOver(idx)}
                    onClick={() => {
                      if (!isDragging.current) {
                        setActiveTab(tab);
                        if (longPressTimer.current) {
                          window.clearTimeout(longPressTimer.current);
                          longPressTimer.current = null;
                        }
                      }
                    }}
                    className={`
                      relative px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap
                      ${isActive ? `${getTabTheme(tab)} rounded-t-xl scale-y-105 origin-bottom shadow-lg z-10` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}
                      ${isBeingDragged ? 'opacity-30 scale-110 z-50 pointer-events-none' : ''}
                      ${isDragging.current && !isBeingDragged ? 'transform translate-x-0 transition-transform duration-300' : ''}
                    `}
                    style={{
                      transform: isBeingDragged ? 'translateY(-12px)' : undefined,
                    }}
                  >
                    {isActive && <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />}
                    {tab}
                    {isBeingDragged && (
                       <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#76C7C0] text-white text-[8px] px-2 py-0.5 rounded font-black whitespace-nowrap shadow-lg">
                         SLIDING...
                       </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    );
  }

  if (!hasStarted) { 
    return (
      <LandingPage onStart={() => {
        localStorage.setItem('habitos_has_started', 'true');
        setHasStarted(true);
      }} />
    );
  }
  
  return (
    <AuthView 
      onSuccess={() => {}} 
      onBack={() => {
        localStorage.removeItem('habitos_has_started');
        setHasStarted(false);
      }} 
    />
  );
};

export default App;