import React, { useState, useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Tooltip, AreaChart, Area,
  ResponsiveContainer
} from 'recharts';
import { AnnualCategory, WeeklyGoal } from '../types';
import { MONTHS_LIST } from '../constants';

// --- TYPES ---
interface AnnualGoalsViewProps {
  year: string;
  categories: AnnualCategory[];
  onUpdateCategory: (index: number, updates: Partial<AnnualCategory>) => void;
  onAddCategory: () => void;
  onDeleteCategory: (index: number) => void;
  weeklyGoals: WeeklyGoal[];
  onUpdateWeeklyGoals: (month: string, weekIndex: number, goals: { text: string; completed: boolean }[]) => void;
}

// --- PREMIUM PALETTE (Unchanged) ---
const PALETTE = {
  accents: [
    { name: 'Indigo', bg: 'bg-indigo-600',  hex: '#4F46E5', text: 'text-indigo-600', border: 'border-indigo-100', softBg: 'bg-indigo-50/50' },
    { name: 'Teal',   bg: 'bg-teal-500',    hex: '#14B8A6', text: 'text-teal-600', border: 'border-teal-100', softBg: 'bg-teal-50/50' },
    { name: 'Violet', bg: 'bg-violet-600',  hex: '#7C3AED', text: 'text-violet-600', border: 'border-violet-100', softBg: 'bg-violet-50/50' },
    { name: 'Amber',  bg: 'bg-amber-500',   hex: '#F59E0B', text: 'text-amber-600', border: 'border-amber-100', softBg: 'bg-amber-50/50' },
    { name: 'Rose',   bg: 'bg-rose-500',    hex: '#F43F5E', text: 'text-rose-600', border: 'border-rose-100', softBg: 'bg-rose-50/50' },
    { name: 'Sky',    bg: 'bg-sky-500',     hex: '#0EA5E9', text: 'text-sky-600', border: 'border-sky-100', softBg: 'bg-sky-50/50' },
  ]
};

const WEEK_LABELS = ['WK 01', 'WK 02', 'WK 03', 'WK 04', 'EXTRA'];

// --- UI COMPONENTS ---
// Smaller, clearer stat label
const StatLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">{children}</span>
);

export const AnnualGoalsView: React.FC<AnnualGoalsViewProps> = ({ 
  year, 
  categories, 
  onUpdateCategory,
  onAddCategory,
  onDeleteCategory,
  weeklyGoals,
  onUpdateWeeklyGoals
}) => {
  const [selectedMonthForWeekly, setSelectedMonthForWeekly] = useState(MONTHS_LIST[0]);

  // --- DATA CALCULATIONS (Unchanged) ---
  const radarData = useMemo(() => {
    return categories.map((cat, index) => {
      const completed = cat.goals.filter(g => g.completed).length;
      const progress = cat.goals.length > 0 ? (completed / cat.goals.length) * 100 : 0;
      return { 
        subject: cat.name ? (cat.name.length > 10 ? cat.name.substring(0, 8) + '..' : cat.name) : `Zone ${index + 1}`, 
        A: progress, 
        fullMark: 100 
      };
    });
  }, [categories]);

  const pieChartData = useMemo(() => {
    return categories.map((cat, i) => ({
      name: cat.name || `Category ${i+1}`,
      value: Math.max(cat.goals.length, 1),
      paletteIndex: i % PALETTE.accents.length,
    }));
  }, [categories]);

  const totalGoalsCount = useMemo(() => categories.reduce((acc, cat) => acc + cat.goals.length, 0), [categories]);
  const totalCompleted = useMemo(() => categories.reduce((acc, cat) => acc + cat.goals.filter(g => g.completed).length, 0), [categories]);
  const totalProgress = totalGoalsCount > 0 ? Math.round((totalCompleted / totalGoalsCount) * 100) : 0;

  const sprintTrendData = useMemo(() => {
    return WEEK_LABELS.map((label, idx) => {
      const goals = weeklyGoals.find(w => w.month === selectedMonthForWeekly && w.weekIndex === idx)?.goals || [];
      const val = goals.length > 0 ? (goals.filter(g => g.completed).length / goals.length) * 100 : 0;
      return { name: label, value: Math.round(val) };
    });
  }, [weeklyGoals, selectedMonthForWeekly]);

  // --- HANDLERS ---
  const handleWeeklyUpdate = (weekIdx: number, newGoals: { text: string; completed: boolean }[]) => {
    onUpdateWeeklyGoals(selectedMonthForWeekly, weekIdx, newGoals);
  };

  const addWeeklyItem = (weekIdx: number) => {
    const goals = weeklyGoals.find(w => w.month === selectedMonthForWeekly && w.weekIndex === weekIdx)?.goals || [];
    handleWeeklyUpdate(weekIdx, [...goals, { text: 'New Target', completed: false }]);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* 1. HERO HEADER */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 md:mb-12">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Strategic Vector 2.0</span>
            </div>
            {/* Reduced Text Size for clarity */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900 leading-[0.9] italic">
              {year}<span className="text-slate-200 not-italic">.</span>MASTER
            </h1>
          </div>

          <div className="flex flex-row items-center gap-4 w-full md:w-auto animate-in fade-in slide-in-from-right duration-700">
             <div className="bg-white border border-slate-100 px-6 py-4 rounded-3xl shadow-lg shadow-slate-100 flex flex-col items-end min-w-[140px]">
                <StatLabel>Total Fidelity</StatLabel>
                <div className="text-3xl md:text-4xl font-black text-slate-900 flex items-baseline gap-1 italic">
                   {totalProgress}<span className="text-sm text-slate-300 not-italic">%</span>
                </div>
                <div className="w-full h-1 bg-slate-50 rounded-full mt-2 overflow-hidden">
                   <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${totalProgress}%` }} />
                </div>
             </div>
             
             <button 
                onClick={onAddCategory}
                className="bg-slate-900 text-white hover:bg-indigo-600 transition-all px-6 py-4 h-full rounded-3xl shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
             >
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest hidden md:inline">Add Zone</span>
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest md:hidden">Add</span>
                <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
             </button>
          </div>
        </header>

        {/* 2. ANALYTICS BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 mb-12">
           
           {/* Radar: Macro Balance */}
           <div className="lg:col-span-4 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden relative group h-[280px]">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                 <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12L12 22L22 12L12 2Z"/></svg>
              </div>
              <div className="relative z-10">
                <StatLabel>Macro Balance</StatLabel>
                <h2 className="text-lg md:text-xl font-black text-slate-900 italic tracking-tighter">Fidelity Radar</h2>
              </div>
              <div className="flex-1 w-full mt-2 flex items-center justify-center -ml-2">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                       <PolarGrid stroke="#F1F5F9" />
                       <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#94A3B8', fontSize: 9, fontWeight: 700, letterSpacing: '0.05em' }} 
                       />
                       <Radar name="Zone Health" dataKey="A" stroke="#6366F1" strokeWidth={2} fill="#6366F1" fillOpacity={0.15} animationDuration={1500} />
                       <Tooltip 
                           contentStyle={{ background: '#111827', border: 'none', borderRadius: '0.75rem', padding: '8px' }}
                           itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}
                       />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Distribution Pie */}
           <div className="lg:col-span-5 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col relative h-[280px]">
              <div className="absolute top-6 left-6 z-10">
                 <StatLabel>Architecture</StatLabel>
                 <h2 className="text-lg md:text-xl font-black text-slate-900 italic tracking-tighter">Goal Mix</h2>
              </div>
              
              <div className="relative w-full h-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={pieChartData}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                          paddingAngle={6} cornerRadius={8} dataKey="value" stroke="none"
                          animationDuration={2000}
                       >
                          {pieChartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={PALETTE.accents[entry.paletteIndex].hex} className="hover:opacity-80 transition-opacity outline-none" />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-4">
                    <span className="text-3xl font-black text-slate-900 italic leading-none">{totalGoalsCount}</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Nodes</span>
                 </div>
              </div>
           </div>

           {/* Metrics Pillar */}
           <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-4 h-auto lg:h-[280px]">
              <div className="flex-1 bg-slate-900 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center group transition-all hover:bg-slate-800">
                 <StatLabel>Status</StatLabel>
                 <div className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-1 uppercase group-hover:scale-105 transition-transform">
                   {totalProgress > 75 ? 'Optimal' : totalProgress > 40 ? 'Active' : 'Init'}
                 </div>
                 <div className="px-2 py-0.5 bg-white/10 rounded text-[9px] font-bold text-[#76C7C0] uppercase tracking-wider">Tier 1</div>
              </div>
              
              <div className="flex-1 bg-[#F1F5F9] rounded-[2rem] p-6 flex flex-col justify-center items-center text-center">
                 <StatLabel>Active Sprint</StatLabel>
                 <h3 className="text-2xl md:text-3xl font-black text-slate-900 italic tracking-tighter uppercase">{selectedMonthForWeekly.slice(0, 3)}</h3>
                 <div className="mt-2 flex gap-1">
                    {WEEK_LABELS.map((_, i) => (
                       <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* 3. CATEGORY NODES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
           {categories.map((cat, catIdx) => {
              const theme = PALETTE.accents[catIdx % PALETTE.accents.length];
              const completed = cat.goals.filter(g => g.completed).length;
              const progress = cat.goals.length > 0 ? Math.round((completed / cat.goals.length) * 100) : 0;

              return (
                <div key={catIdx} className="group bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex-1 mr-2">
                         <input 
                           value={cat.name}
                           onChange={(e) => onUpdateCategory(catIdx, { name: e.target.value })}
                           className={`w-full text-lg font-black text-slate-900 bg-transparent outline-none focus:${theme.text} transition-colors uppercase italic tracking-tight placeholder-slate-300`}
                           placeholder="ZONE NAME"
                         />
                         <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[9px] font-black uppercase ${theme.text} ${theme.softBg} px-2 py-0.5 rounded tracking-wider`}>
                               {progress}%
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{completed}/{cat.goals.length}</span>
                         </div>
                      </div>
                      <button onClick={() => onDeleteCategory(catIdx)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all text-lg font-light">×</button>
                   </div>

                   <div className="flex-1 space-y-3">
                      {cat.goals.map((goal, goalIdx) => (
                        <div key={goalIdx} className="flex items-start gap-2 group/item">
                           <button 
                             onClick={() => {
                               const goals = [...cat.goals];
                               goals[goalIdx].completed = !goals[goalIdx].completed;
                               onUpdateCategory(catIdx, { goals });
                             }}
                             className={`mt-0.5 w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all duration-300 flex-shrink-0
                               ${goal.completed ? `${theme.bg} border-transparent` : 'border-slate-200 bg-slate-50 hover:border-slate-400'}
                             `}
                           >
                             {goal.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>}
                           </button>
                           <input 
                             value={goal.text}
                             onChange={(e) => {
                               const goals = [...cat.goals];
                               goals[goalIdx].text = e.target.value;
                               onUpdateCategory(catIdx, { goals });
                             }}
                             className={`flex-1 text-[13px] font-medium bg-transparent outline-none py-0 leading-tight border-b border-transparent focus:border-slate-200 transition-all
                               ${goal.completed ? 'text-slate-300 line-through decoration-slate-300' : 'text-slate-600'}
                             `}
                           />
                           <button 
                             onClick={() => {
                               const goals = cat.goals.filter((_, i) => i !== goalIdx);
                               onUpdateCategory(catIdx, { goals });
                             }}
                             className="opacity-0 group-hover/item:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                           >
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeWidth="2.5"/></svg>
                           </button>
                        </div>
                      ))}
                   </div>

                   <button 
                     onClick={() => onUpdateCategory(catIdx, { goals: [...cat.goals, { text: 'New Target', completed: false }] })}
                     className="mt-6 py-2.5 w-full bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center gap-2 transition-all group"
                   >
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-700">+ Add Task</span>
                   </button>
                </div>
              );
           })}
        </div>

        {/* 4. TACTICAL SPRINT BOARD - Compact Dark Mode */}
        <div className="bg-[#0F172A] rounded-[2.5rem] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
           
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-10 relative z-10">
              <div>
                 <StatLabel>Deployment</StatLabel>
                 <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter">Tactical Sprint</h2>
                 <p className="text-slate-400 text-sm font-medium mt-2 max-w-lg leading-relaxed">Weekly execution blocks. High fidelity.</p>
              </div>

              {/* Scrollable Month Selector */}
              <div className="flex items-center gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar w-full xl:w-auto mask-linear-fade">
                 {MONTHS_LIST.map(m => (
                    <button 
                       key={m} 
                       onClick={() => setSelectedMonthForWeekly(m)}
                       className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0
                          ${selectedMonthForWeekly === m ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}
                       `}
                    >
                       {m}
                    </button>
                 ))}
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
              {/* Velocity Summary - Sidebar on Desktop */}
              <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-4">
                 <div className="flex-1 bg-white/5 border border-white/5 p-6 rounded-[2rem] backdrop-blur-md">
                    <StatLabel>Momentum</StatLabel>
                    <div className="h-28 w-full mt-4">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sprintTrendData}>
                             <defs>
                                <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="0%" stopColor="#6366F1" stopOpacity={0.4}/>
                                   <stop offset="100%" stopColor="#6366F1" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Area type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={3} fill="url(#velocityFill)" animationDuration={2000} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
                 
                 <div className="bg-indigo-600 p-6 rounded-[2rem] text-center shadow-lg shadow-indigo-900/50 flex flex-col justify-center">
                    <StatLabel>Sprint Status</StatLabel>
                    <div className="text-2xl font-black italic uppercase tracking-tighter mt-1">Active</div>
                 </div>
              </div>

              {/* Weekly Blocks - Scrollable on mobile, Grid on desktop */}
              <div className="lg:col-span-9 overflow-x-auto pb-4 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0">
                 <div className="flex lg:grid lg:grid-cols-5 gap-3 min-w-[800px] lg:min-w-0">
                   {WEEK_LABELS.map((label, weekIdx) => {
                      const goals = weeklyGoals.find(w => w.month === selectedMonthForWeekly && w.weekIndex === weekIdx)?.goals || [];
                      const isExtra = label === 'EXTRA';
                      
                      return (
                         <div key={weekIdx} className="bg-white/5 border border-white/5 rounded-[1.5rem] p-4 hover:bg-white/10 transition-colors flex flex-col h-[280px] lg:h-auto w-full">
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                               <span className={`text-[9px] font-black tracking-[0.2em] uppercase italic ${isExtra ? 'text-emerald-400' : 'text-slate-500'}`}>{label}</span>
                               <div className={`w-1 h-1 rounded-full ${goals.length > 0 && goals.every(g => g.completed) ? 'bg-emerald-400 shadow-[0_0_8px_#34D399]' : 'bg-white/10'}`} />
                            </div>

                            <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                               {goals.map((goal, goalIdx) => (
                                  <div key={goalIdx} className="group/goal flex items-start gap-2 relative">
                                     <button 
                                        onClick={() => {
                                          const newGoals = [...goals];
                                          newGoals[goalIdx].completed = !newGoals[goalIdx].completed;
                                          handleWeeklyUpdate(weekIdx, newGoals);
                                        }}
                                        className={`mt-1 w-3 h-3 rounded-[3px] border transition-all flex-shrink-0 flex items-center justify-center
                                           ${goal.completed ? 'bg-indigo-500 border-indigo-500' : 'border-white/20 bg-white/5 hover:border-white/40'}
                                        `}
                                     >
                                        {goal.completed && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>}
                                     </button>
                                     <textarea 
                                        value={goal.text}
                                        onChange={(e) => {
                                          const newGoals = [...goals];
                                          newGoals[goalIdx].text = e.target.value;
                                          handleWeeklyUpdate(weekIdx, newGoals);
                                        }}
                                        className={`flex-1 bg-transparent outline-none text-[10px] md:text-[11px] font-medium leading-relaxed resize-none transition-all
                                           ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-300'}
                                        `}
                                        rows={2}
                                     />
                                     <button 
                                        onClick={() => {
                                          const newGoals = goals.filter((_, i) => i !== goalIdx);
                                          handleWeeklyUpdate(weekIdx, newGoals);
                                        }}
                                        className="opacity-0 group-hover/goal:opacity-100 text-slate-600 hover:text-rose-500 transition-all"
                                     >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeWidth="2.5"/></svg>
                                     </button>
                                  </div>
                               ))}
                            </div>

                            <button 
                               onClick={() => addWeeklyItem(weekIdx)}
                               className="mt-4 py-2 border border-dashed border-white/10 hover:border-white/30 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all w-full"
                            >
                               + Entry
                            </button>
                         </div>
                      );
                   })}
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};