
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

// --- PREMIUM PALETTE ---
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

const StatLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1 block italic">{children}</span>
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

  const radarData = useMemo(() => {
    return categories.map((cat, index) => {
      const completed = cat.goals.filter(g => g.completed).length;
      const progress = cat.goals.length > 0 ? (completed / cat.goals.length) * 100 : 0;
      return { 
        subject: cat.name || `Zone ${index + 1}`, 
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

  const handleWeeklyUpdate = (weekIdx: number, newGoals: { text: string; completed: boolean }[]) => {
    onUpdateWeeklyGoals(selectedMonthForWeekly, weekIdx, newGoals);
  };

  const addWeeklyItem = (weekIdx: number) => {
    const goals = weeklyGoals.find(w => w.month === selectedMonthForWeekly && w.weekIndex === weekIdx)?.goals || [];
    handleWeeklyUpdate(weekIdx, [...goals, { text: 'New Target', completed: false }]);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-indigo-500 selection:text-white pb-32">
      <div className="max-w-[1500px] mx-auto p-6 md:p-12">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
          <div className="animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Strategic Vector 2.0</span>
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter text-slate-900 leading-[0.8] italic">
              {year}<span className="text-slate-100 not-italic">.</span>MASTER
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 w-full lg:w-auto animate-in fade-in slide-in-from-right duration-700">
             <div className="bg-white border border-slate-100 p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 flex flex-col items-end min-w-[200px]">
                <StatLabel>Total Fidelity</StatLabel>
                <div className="text-6xl font-black text-slate-900 flex items-baseline gap-1 italic">
                   {totalProgress}<span className="text-xl text-slate-300 not-italic">%</span>
                </div>
                <div className="w-full h-1 bg-slate-50 rounded-full mt-4 overflow-hidden">
                   <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${totalProgress}%` }} />
                </div>
             </div>
             
             <button onClick={onAddCategory} className="bg-slate-900 text-white hover:bg-indigo-600 transition-all px-10 py-6 rounded-3xl shadow-2xl active:scale-95 flex items-center justify-center gap-4 group">
                <span className="text-xs font-black uppercase tracking-widest">Add Zone</span>
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
           <div className="lg:col-span-4 bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10">
                <StatLabel>Macro Balance</StatLabel>
                <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">Fidelity Radar</h2>
              </div>
              <div className="h-[280px] w-full mt-4 flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                       <PolarGrid stroke="#F1F5F9" />
                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10, fontWeight: 800 }} />
                       <Radar name="Zone Health" dataKey="A" stroke="#6366F1" strokeWidth={3} fill="#6366F1" fillOpacity={0.15} animationDuration={1500} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="lg:col-span-5 bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative">
              <div className="absolute top-10 left-10">
                 <StatLabel>Architecture</StatLabel>
                 <h2 className="text-3xl font-black text-slate-900 italic tracking-tighter">Goal Mix</h2>
              </div>
              <div className="relative w-full h-[320px] flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={85} outerRadius={110} paddingAngle={8} cornerRadius={12} dataKey="value" stroke="none">
                          {pieChartData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={PALETTE.accents[entry.paletteIndex].hex} />
                          ))}
                       </Pie>
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-5xl font-black text-slate-900 italic">{totalGoalsCount}</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Nodes</span>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="flex-1 bg-slate-900 rounded-[3rem] p-8 flex flex-col justify-center items-center text-center group transition-all hover:bg-slate-800">
                 <StatLabel>Status</StatLabel>
                 <div className="text-4xl font-black text-white italic tracking-tighter mb-2 uppercase group-hover:scale-110 transition-transform">
                   {totalProgress > 75 ? 'Optimal' : totalProgress > 40 ? 'Active' : 'Init'}
                 </div>
              </div>
              <div className="flex-1 bg-[#F1F5F9] rounded-[3rem] p-8 flex flex-col justify-center items-center text-center">
                 <StatLabel>Active Sprint</StatLabel>
                 <h3 className="text-4xl font-black text-slate-900 italic tracking-tighter uppercase">{selectedMonthForWeekly.slice(0, 3)}</h3>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-24">
           {categories.map((cat, catIdx) => {
              const theme = PALETTE.accents[catIdx % PALETTE.accents.length];
              const completed = cat.goals.filter(g => g.completed).length;
              const progress = cat.goals.length > 0 ? Math.round((completed / cat.goals.length) * 100) : 0;

              return (
                <div key={catIdx} className="group bg-white rounded-[3.5rem] p-10 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col">
                   <div className="flex justify-between items-start mb-8">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-slate-50 border border-slate-100">
                            {cat.icon || '🎯'}
                         </div>
                         <div className="flex-1">
                            <input value={cat.name} onChange={(e) => onUpdateCategory(catIdx, { name: e.target.value })} className="w-full text-xl font-black text-slate-900 bg-transparent outline-none uppercase italic tracking-tighter" />
                            <div className="flex items-center gap-2 mt-1">
                               <span className={`text-[9px] font-black uppercase ${theme.text} ${theme.softBg} px-2 py-0.5 rounded tracking-widest`}>{progress}% Sync</span>
                            </div>
                         </div>
                      </div>
                      <button onClick={() => onDeleteCategory(catIdx)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-200 hover:text-rose-500 transition-all text-xl">×</button>
                   </div>
                   <div className="flex-1 space-y-3 mt-4">
                      {cat.goals.map((goal, goalIdx) => (
                        <div key={goalIdx} className="flex items-start gap-3 group/item">
                           <button onClick={() => {
                               const goals = [...cat.goals];
                               goals[goalIdx].completed = !goals[goalIdx].completed;
                               onUpdateCategory(catIdx, { goals });
                           }} className={`mt-1 w-4 h-4 rounded border-2 transition-all ${goal.completed ? theme.bg : 'bg-slate-50 border-slate-100'}`}>
                             {goal.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>}
                           </button>
                           <input value={goal.text} onChange={(e) => {
                               const goals = [...cat.goals];
                               goals[goalIdx].text = e.target.value;
                               onUpdateCategory(catIdx, { goals });
                           }} className={`flex-1 text-[12px] font-bold bg-transparent outline-none ${goal.completed ? 'text-slate-300 line-through' : 'text-slate-600'}`} />
                        </div>
                      ))}
                   </div>
                   <button onClick={() => onUpdateCategory(catIdx, { goals: [...cat.goals, { text: 'New Target', completed: false }] })} className="mt-8 py-3 w-full bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center gap-3 transition-all text-[9px] font-black uppercase text-slate-400 hover:text-slate-900">+ Add Task</button>
                </div>
              );
           })}
        </div>

        <div className="bg-[#0F172A] rounded-[4rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
           <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12 mb-16 relative z-10">
              <div>
                 <StatLabel>Deployment</StatLabel>
                 <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter">Tactical Sprint</h2>
                 <p className="text-slate-400 font-medium italic mt-2">Break annual vision into weekly blocks.</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded-[2rem] border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar max-w-full">
                 {MONTHS_LIST.map(m => (
                    <button key={m} onClick={() => setSelectedMonthForWeekly(m)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedMonthForWeekly === m ? 'bg-indigo-500 text-white' : 'text-slate-500 hover:text-white'}`}>{m}</button>
                 ))}
              </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
              <div className="lg:col-span-3 flex flex-col gap-8">
                 <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] backdrop-blur-md">
                    <StatLabel>Momentum Trend</StatLabel>
                    <div className="h-40 w-full mt-6">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={sprintTrendData}>
                             <Area type="monotone" dataKey="value" stroke="#818CF8" strokeWidth={4} fill="#818CF833" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                 {WEEK_LABELS.map((label, weekIdx) => {
                    const goals = weeklyGoals.find(w => w.month === selectedMonthForWeekly && w.weekIndex === weekIdx)?.goals || [];
                    return (
                       <div key={weekIdx} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-6 flex flex-col min-h-[300px]">
                          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                             <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">{label}</span>
                             <div className={`w-1.5 h-1.5 rounded-full ${goals.length > 0 && goals.every(g => g.completed) ? 'bg-emerald-400' : 'bg-white/10'}`} />
                          </div>
                          <div className="flex-1 space-y-4">
                             {goals.map((goal, goalIdx) => (
                                <div key={goalIdx} className="flex items-start gap-3">
                                   <button onClick={() => {
                                      const newGoals = [...goals];
                                      newGoals[goalIdx].completed = !newGoals[goalIdx].completed;
                                      handleWeeklyUpdate(weekIdx, newGoals);
                                   }} className={`mt-1 w-4 h-4 rounded border transition-all ${goal.completed ? 'bg-indigo-500 border-indigo-500 shadow-lg' : 'border-white/10'}`}>
                                      {goal.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>}
                                   </button>
                                   <textarea value={goal.text} onChange={(e) => {
                                      const newGoals = [...goals];
                                      newGoals[goalIdx].text = e.target.value;
                                      handleWeeklyUpdate(weekIdx, newGoals);
                                   }} className={`flex-1 bg-transparent outline-none text-[11px] font-bold leading-relaxed resize-none ${goal.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`} rows={2} />
                                </div>
                             ))}
                          </div>
                          <button onClick={() => addWeeklyItem(weekIdx)} className="mt-6 py-3 border border-dashed border-white/10 hover:border-white/40 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">+ Entry</button>
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
