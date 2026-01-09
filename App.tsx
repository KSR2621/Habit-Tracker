
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HabitMatrix } from './components/HabitMatrix.tsx';
import { SetupView } from './components/SetupView.tsx';
import { AnnualGoalsView } from './components/AnnualGoalsView.tsx';
import { FinanceView } from './components/FinanceView.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { AuthView } from './components/AuthView.tsx';
import { PaymentGate } from './components/PaymentGate.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { CreateHabitModal } from './components/CreateHabitModal.tsx';
import { INITIAL_HABITS, MONTHLY_GOALS, ANNUAL_CATEGORIES, INITIAL_WEEKLY_GOALS, MONTHS_LIST } from './constants.tsx';
import { auth, db } from './services/firebase.ts';
import { Habit, Tab, MonthlyGoal, AnnualCategory, PlannerConfig, WeeklyGoal, Transaction, BudgetLimit, EMI } from './types.ts';

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

  // App State
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [monthlyGoals, setMonthlyGoals] = useState<MonthlyGoal[]>(MONTHLY_GOALS);
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>(INITIAL_WEEKLY_GOALS);
  const [annualCategories, setAnnualCategories] = useState<AnnualCategory[]>(ANNUAL_CATEGORIES);
  const [financeTransactions, setFinanceTransactions] = useState<Transaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [emis, setEmis] = useState<EMI[]>([]);
  const [config, setConfig] = useState<PlannerConfig>({
    year: '2026',
    showVisionBoard: true,
    showFinance: true,
    activeMonths: ['January'],
    manifestationText: "Write your plan here. Simple steps to reach your 2026 goals.",
    tabOrder: ['Setup', 'Annual Goals', 'Finance Tracking', 'January'],
    financeCategories: {
      income: ['Salary', 'Freelance', 'Gifts', 'Investments'],
      expense: ['Rent', 'Food', 'Travel', 'Shopping', 'Bills']
    }
  });

  // Drag and drop state
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragCurrentIndex, setDragCurrentIndex] = useState<number | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const isDragging = useRef(false);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isDummyData = habits.length > 0 && habits[0].id === '1' && habits[0].name === INITIAL_HABITS[0].name;

  const allTabs = useMemo(() => {
    const available = ['Setup'];
    if (config.showVisionBoard) available.push('Annual Goals');
    if (config.showFinance) available.push('Finance Tracking');
    (config.activeMonths || []).forEach(m => available.push(m));
    if (isAdmin) available.push('Admin Control');
    
    let baseOrder = config.tabOrder || [];
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
  }, [config.tabOrder, config.showVisionBoard, config.showFinance, config.activeMonths, isAdmin, dragIndex, dragCurrentIndex]);

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
            if (currentStatus === 'approved' && cloudValidUntil && new Date(cloudValidUntil) < new Date()) {
                currentStatus = 'pending';
                db.collection('users').doc(user.uid).update({ status: 'pending', validUntil: null });
            }
            setUserStatus(currentStatus);
            setValidUntil(cloudValidUntil || null);
            setIsPaid(data.isPaid === true);
            if (data.createdAt) setUserCreatedAt(data.createdAt);
            if (data.habits) setHabits(data.habits);
            if (data.monthlyGoals) setMonthlyGoals(data.monthlyGoals);
            if (data.weeklyGoals) setWeeklyGoals(data.weeklyGoals);
            if (data.annualCategories) setAnnualCategories(data.annualCategories);
            if (data.financeTransactions) setFinanceTransactions(data.financeTransactions);
            if (data.budgetLimits) setBudgetLimits(data.budgetLimits);
            if (data.emis) setEmis(data.emis);
            if (data.config) setConfig(prev => ({ ...prev, ...data.config }));
          }
        }
        setDataLoaded(true);
      }, (error) => {
        if (error.code === 'permission-denied') setPermissionError(true);
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
    if (permissionError) return <div className="p-20 text-center font-black">SYNC ERROR.</div>;
    if (userStatus === 'blocked') return <div className="p-20 text-center font-black">ACCESS BLOCKED.</div>;
    if (!isPaid) return <PaymentGate userId={user.uid} userEmail={user.email} onSuccess={() => setIsPaid(true)} />;
    if (userStatus === 'pending') return <div className="p-20 text-center font-black">WAITING FOR APPROVAL.</div>;

    switch (activeTab) {
      case 'Setup':
        return (
          <SetupView 
            isDummyData={isDummyData}
            onClearDummyData={() => {
              setHabits([]); setMonthlyGoals([]); setAnnualCategories([]); setWeeklyGoals([]);
              syncToCloud({ habits: [], monthlyGoals: [], annualCategories: [], weeklyGoals: [] });
            }}
            habits={habits} onUpdateHabit={(id, u) => {
              const nh = habits.map(h => h.id === id ? { ...h, ...u } : h);
              setHabits(nh); syncToCloud({ habits: nh });
            }}
            onDeleteHabit={(id) => {
              const nh = habits.filter(h => h.id !== id);
              setHabits(nh); syncToCloud({ habits: nh });
            }}
            onAddHabit={() => setIsAddModalOpen(true)}
            monthlyGoals={monthlyGoals}
            onUpdateMonthlyGoals={(m, g) => {
              const monthExists = monthlyGoals.some(x => x.month === m);
              const nmg = monthExists ? monthlyGoals.map(x => x.month === m ? { ...x, goals: g } : x) : [...monthlyGoals, { month: m, goals: g }];
              setMonthlyGoals(nmg); syncToCloud({ monthlyGoals: nmg });
            }}
            onAddMonthlyGoalContainer={(m) => {
              const nmg = [...monthlyGoals, { month: m, goals: [] }];
              setMonthlyGoals(nmg); syncToCloud({ monthlyGoals: nmg });
            }}
            onDeleteMonthlyGoalContainer={(m) => {
              const nmg = monthlyGoals.filter(x => x.month !== m);
              setMonthlyGoals(nmg); syncToCloud({ monthlyGoals: nmg });
            }}
            config={config} onUpdateConfig={(c) => { setConfig(c); syncToCloud({ config: c }); }}
            subscriptionRemaining={subscriptionRemaining} allTabs={allTabs}
          />
        );
      case 'Annual Goals':
        return (
          <AnnualGoalsView 
            year={config.year} categories={annualCategories} onUpdateCategory={(idx, u) => {
              const nc = annualCategories.map((c, i) => i === idx ? { ...c, ...u } : c);
              setAnnualCategories(nc); syncToCloud({ annualCategories: nc });
            }}
            onAddCategory={() => {
              const nc = [...annualCategories, { name: 'New Goal Area', goals: [] }];
              setAnnualCategories(nc); syncToCloud({ annualCategories: nc });
            }}
            onDeleteCategory={(idx) => {
              const nc = annualCategories.filter((_, i) => i !== idx);
              setAnnualCategories(nc); syncToCloud({ annualCategories: nc });
            }}
            weeklyGoals={weeklyGoals} onUpdateWeeklyGoals={(m, wi, g) => {
              const idx = weeklyGoals.findIndex(w => w.month === m && w.weekIndex === wi);
              const nwg = idx > -1 ? weeklyGoals.map((w, i) => i === idx ? { ...w, goals: g } : w) : [...weeklyGoals, { month: m, weekIndex: wi, goals: g }];
              setWeeklyGoals(nwg); syncToCloud({ weeklyGoals: nwg });
            }}
          />
        );
      case 'Finance Tracking':
        return (
          <FinanceView 
            transactions={financeTransactions}
            budgetLimits={budgetLimits}
            emis={emis}
            categories={config.financeCategories || { income: [], expense: [] }}
            onUpdateCategories={(newCats) => {
              const newConf = { ...config, financeCategories: newCats };
              setConfig(newConf);
              syncToCloud({ config: newConf });
            }}
            onAddTransaction={(t) => {
              const nt = [...financeTransactions, { ...t, id: Math.random().toString(36).substr(2, 9) }];
              setFinanceTransactions(nt); syncToCloud({ financeTransactions: nt });
            }}
            onUpdateTransaction={(id, updates) => {
              const nt = financeTransactions.map(t => t.id === id ? { ...t, ...updates } : t);
              setFinanceTransactions(nt); syncToCloud({ financeTransactions: nt });
            }}
            onDeleteTransaction={(id) => {
              const nt = financeTransactions.filter(t => t.id !== id);
              setFinanceTransactions(nt); syncToCloud({ financeTransactions: nt });
            }}
            onUpdateBudget={(cat, lim) => {
              const idx = budgetLimits.findIndex(l => l.category === cat);
              const nbl = idx > -1 ? budgetLimits.map((l, i) => i === idx ? { ...l, limit: lim } : l) : [...budgetLimits, { category: cat, limit: lim }];
              setBudgetLimits(nbl); syncToCloud({ budgetLimits: nbl });
            }}
            onAddEMI={(emi) => {
              const ne = [...emis, { ...emi, id: Math.random().toString(36).substr(2, 9) }];
              setEmis(ne); syncToCloud({ emis: ne });
            }}
            onUpdateEMI={(id, updates) => {
              const ne = emis.map(e => e.id === id ? { ...e, ...updates } : e);
              setEmis(ne); syncToCloud({ emis: ne });
            }}
            onDeleteEMI={(id) => {
              const ne = emis.filter(e => e.id !== id);
              setEmis(ne); syncToCloud({ emis: ne });
            }}
          />
        );
      default:
        if (MONTHS_LIST.includes(activeTab)) {
          return <HabitMatrix month={activeTab} year={config.year} habits={habits} weeklyGoals={weeklyGoals.filter(w => w.month === activeTab)} onUpdateWeeklyGoalStatus={()=>{}} onToggleCell={(id, day) => {
            const nh = habits.map(h => {
              if (h.id === id) {
                const hist = h.history[activeTab] || {};
                const nhist = { ...hist, [day]: !hist[day] };
                return { ...h, history: { ...h.history, [activeTab]: nhist } };
              }
              return h;
            });
            setHabits(nh); syncToCloud({ habits: nh });
          }} />;
        }
        return <div className="p-20 text-center font-bold text-gray-400">Page not found.</div>;
    }
  };

  const getTabTheme = (tab: string) => {
    if (tab === 'Admin Control') return 'bg-rose-600 text-white';
    if (tab === 'Setup') return 'bg-slate-800 text-white';
    if (tab === 'Annual Goals') return 'bg-[#76C7C0] text-white';
    if (tab === 'Finance Tracking') return 'bg-indigo-600 text-white';
    const monthIdx = MONTHS_LIST.indexOf(tab);
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-amber-500', 'bg-emerald-600', 'bg-rose-600', 'bg-sky-500', 'bg-violet-600', 'bg-orange-600', 'bg-teal-600', 'bg-pink-600', 'bg-indigo-700', 'bg-cyan-600'];
    return monthIdx !== -1 ? colors[monthIdx % colors.length] : 'bg-slate-200 text-slate-600';
  };

  if (authLoading) return <div className="min-h-screen bg-white flex items-center justify-center font-black animate-pulse">LOADING...</div>;
  if (!user) {
    if (!hasStarted) return <LandingPage onStart={() => { setHasStarted(true); localStorage.setItem('habitos_has_started', 'true'); }} />;
    return <AuthView onSuccess={() => {}} onBack={() => { setHasStarted(false); localStorage.removeItem('habitos_has_started'); }} />;
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="planner-container">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-12 p-4 md:p-8 rounded-[1.5rem] md:rounded-[3rem] bg-white border border-slate-100 shadow-sm gap-4 md:gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-gray-900 rounded-xl md:rounded-[1.8rem] flex items-center justify-center text-white font-black text-xl md:text-3xl shadow-xl animate-float">N</div>
            <div>
              <h1 className="text-xl md:text-6xl font-black tracking-tighter text-gray-900 leading-none">{config.year} NextYou21</h1>
              <p className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 mt-1 md:mt-2">Daily Routine & Finance Console</p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
             <div className="text-left md:text-right">
               <div className={`inline-flex items-center gap-2 ${syncing ? 'bg-amber-400' : 'bg-[#76C7C0]'} text-white px-3 md:px-5 py-1 md:py-2 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg transition-all`}>
                 <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-white ${syncing ? 'animate-ping' : ''}`} />
                 {syncing ? 'Saving' : 'Saved'}
               </div>
               <p className="hidden md:block text-[11px] font-black text-slate-400 mt-2 uppercase">{user.displayName || user.email}</p>
               <p className="md:hidden text-[9px] font-black text-slate-300 mt-1 uppercase truncate max-w-[120px]">{user.displayName || user.email.split('@')[0]}</p>
             </div>
             <button onClick={handleLogout} className="p-3 md:p-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-[1.5rem] hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm group">
               <svg className="w-4 h-4 md:w-5 md:h-5 text-slate-400 group-hover:text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" /></svg>
             </button>
          </div>
        </header>

        <main className="min-h-[50vh]">{renderContent()}</main>

        {(isPaid && userStatus === 'approved' && !permissionError) && (
          <nav 
            className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-[60] px-6 flex items-end h-[68px] overflow-x-auto no-scrollbar shadow-xl select-none"
            onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd} onTouchEnd={handleDragEnd}
          >
            <div className="flex items-end h-full gap-1 relative min-w-full">
              {allTabs.map((tab, idx) => (
                <button
                  key={`${tab}-${idx}`} onMouseDown={() => handleDragStart(idx)} onTouchStart={() => handleDragStart(idx)} onMouseEnter={() => handleDragOver(idx)}
                  onClick={() => !isDragging.current && setActiveTab(tab)}
                  className={`relative px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 cursor-pointer whitespace-nowrap ${activeTab === tab ? `${getTabTheme(tab)} rounded-t-xl scale-y-105 origin-bottom shadow-lg z-10` : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'}`}
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
              const newH = { ...data, id: Math.random().toString(36).substr(2, 9), completed: false, streak: 0, history: {} };
              const nh = [...habits, newH]; setHabits(nh); syncToCloud({ habits: nh });
              setIsAddModalOpen(false);
            }} 
          />
        )}
      </div>
    </div>
  );
};

export default App;
