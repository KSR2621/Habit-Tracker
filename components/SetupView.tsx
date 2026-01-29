
import React, { useState } from 'react';
import { Habit, MonthlyGoal, PlannerConfig, MonthlyGoalItem } from '../types';
import { MONTHS_LIST } from '../constants';

interface SetupViewProps {
  isDummyData: boolean;
  onClearDummyData: () => void;
  habits: Habit[];
  onUpdateHabit: (id: string, updates: Partial<Habit>) => void;
  onDeleteHabit: (id: string) => void;
  onAddHabit: () => void;
  monthlyGoals: MonthlyGoal[];
  onUpdateMonthlyGoals: (month: string, goals: MonthlyGoalItem[]) => void;
  onAddMonthlyGoalContainer: (month: string) => void;
  onDeleteMonthlyGoalContainer: (month: string) => void;
  config: PlannerConfig;
  onUpdateConfig: (config: PlannerConfig) => void;
  subscriptionRemaining?: number;
  allTabs: string[];
}

const THEME = {
  bg: '#FDFDFD',
  sidebarBox: '#FFD8A8',
  sidebarText: '#8C4B15',
  sidebarBorder: '#FFC078',
  blueHeader: '#E0F2FE',
  blueText: '#0369A1',
  orangeRow: '#FFF7ED',
  slateHeader: '#F0F9FF',
  shadow: 'shadow-[4px_4px_0px_rgba(0,0,0,0.05)]',
  colors: ['#007ACC', '#5C5C99', '#D4A017', '#C94C4C', '#2E8B57'] 
};

const CATEGORIES: Habit['category'][] = ['Mind', 'Body', 'Spirit', 'Work'];

export const SetupView: React.FC<SetupViewProps> = ({ 
  habits, 
  onUpdateHabit, 
  onDeleteHabit, 
  onAddHabit,
  monthlyGoals,
  onUpdateMonthlyGoals,
  config,
  onUpdateConfig,
  subscriptionRemaining = 0,
}) => {
  const [selectedConfigMonth, setSelectedConfigMonth] = useState<string>(MONTHS_LIST[0]);

  const handleAddMonthlyGoal = (month: string) => {
    const monthData = monthlyGoals.find(m => m.month === month);
    if (monthData) {
      onUpdateMonthlyGoals(month, [...monthData.goals, { text: 'New Target', completed: false }]);
    } else {
      onUpdateMonthlyGoals(month, [{ text: 'New Target', completed: false }]);
    }
  };

  const handleDeleteMonthlyGoal = (month: string, goalIdx: number) => {
    const monthData = monthlyGoals.find(m => m.month === month);
    if (monthData) {
      const newGoals = monthData.goals.filter((_, i) => i !== goalIdx);
      onUpdateMonthlyGoals(month, newGoals);
    }
  };

  const toggleHabitForMonth = (habitId: string, month: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const currentActive = habit.activeMonths || [];
    const newActive = currentActive.includes(month)
      ? currentActive.filter(m => m !== month)
      : [...currentActive, month];
    onUpdateHabit(habitId, { activeMonths: newActive });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-[#FDFDFD] text-slate-700 font-sans">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* --- LEFT SIDEBAR --- */}
      <div className="w-full lg:w-[280px] flex-shrink-0 space-y-5">
        <div className={`bg-[#FFD8A8] rounded-xl p-6 text-center border border-[#FFC078] ${THEME.shadow}`}>
          <h1 className="text-xl font-black text-[#8C4B15] tracking-tight uppercase">System Setup</h1>
          <div className="mt-4 bg-white/40 rounded-lg p-2 backdrop-blur-sm">
             <label className="text-[9px] font-bold text-[#A65D1B] uppercase tracking-wider block mb-1">Planning Year</label>
             <input 
                className="w-full text-center text-3xl font-black text-[#8C4B15] bg-transparent outline-none placeholder-[#d49658]"
                value={config.year}
                onChange={(e) => onUpdateConfig({ ...config, year: e.target.value })}
                placeholder="2025"
             />
          </div>
        </div>

        {/* Wallpaper Feature Card */}
        <div className="bg-[#020617] rounded-xl p-5 border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
          <h3 className="text-[10px] font-black text-[#76C7C0] uppercase tracking-[0.4em] mb-4 border-b border-white/5 pb-2 italic">AOD Mode Active</h3>
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic">
              Immersive 24/7 data telemetry. Press <span className="text-white font-black">F11</span> in the Wallpaper tab for true fullscreen.
            </p>
            <div className="mt-2 flex gap-1">
              {[1,2,3,4].map(i => <div key={i} className="h-1 flex-1 bg-indigo-500/20 rounded-full" />)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Active Months</h3>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS_LIST.map((m, idx) => {
                const isActive = config.activeMonths.includes(m);
                const color = THEME.colors[idx % THEME.colors.length];
                return (
                    <button
                        key={m}
                        onClick={() => {
                            const newMonths = isActive ? config.activeMonths.filter(x => x !== m) : [...config.activeMonths, m];
                            onUpdateConfig({...config, activeMonths: MONTHS_LIST.filter(mo => newMonths.includes(mo))});
                        }}
                        className={`text-[9px] font-bold uppercase py-2 rounded-md transition-all border
                            ${isActive ? 'text-white shadow-sm transform scale-105' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                        style={{ backgroundColor: isActive ? color : undefined, borderColor: isActive ? color : undefined }}
                    >
                        {m.slice(0, 3)}
                    </button>
                );
            })}
          </div>
        </div>

        <div className="bg-[#111827] rounded-xl p-5 border border-gray-800 shadow-lg relative overflow-hidden group">
          <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4 border-b border-white/5 pb-2 italic">Access Fidelity</h3>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-black text-white italic tracking-tighter">
                {subscriptionRemaining > 500 ? '∞' : subscriptionRemaining}
              </p>
              <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                {subscriptionRemaining > 500 ? 'Lifetime Access' : 'Days Remaining'}
              </p>
            </div>
            {subscriptionRemaining > 0 && subscriptionRemaining <= 7 && (
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            )}
          </div>
        </div>
      </div>

      {/* --- RIGHT CONTENT --- */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className={`relative rounded-2xl p-8 border border-slate-200 overflow-hidden group ${THEME.shadow}`}>
             <div className="absolute inset-0 bg-gradient-to-br from-[#F0F9FF] via-white to-[#FFF7ED]"></div>
             <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6">
                <div className="flex items-center gap-4 w-full max-w-lg opacity-60">
                   <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-400"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">Annual Manifesto</span>
                   <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-400"></div>
                </div>
                <div className="w-full max-w-3xl">
                    <textarea 
                        className="w-full text-center text-2xl md:text-4xl font-black text-slate-700 placeholder-slate-300 bg-transparent outline-none no-scrollbar leading-tight min-h-[120px] resize-y overflow-auto"
                        placeholder="Define your absolute vision here..."
                        value={config.manifestationText}
                        onChange={(e) => onUpdateConfig({ ...config, manifestationText: e.target.value })}
                    />
                </div>
             </div>
        </div>

        {/* HABIT REGISTRY */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#E0F2FE] p-4 border-b border-white flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-3">
                    <h2 className="text-[12px] font-black text-[#0369A1] uppercase tracking-wider">Habit Registry</h2>
                    <span className="bg-white/50 px-2 py-0.5 rounded text-[10px] font-bold text-[#0369A1]">{habits.length} Habits</span>
                 </div>
                 
                 <div className="flex items-center bg-white/40 rounded-lg p-1 gap-1 overflow-x-auto no-scrollbar max-w-full">
                    {MONTHS_LIST.map(m => (
                        <button key={m} onClick={() => setSelectedConfigMonth(m)} className={`px-3 py-1 rounded text-[9px] font-black uppercase transition-all whitespace-nowrap ${selectedConfigMonth === m ? 'bg-white text-[#0369A1] shadow-sm' : 'text-[#0369A1]/50 hover:text-[#0369A1]'}`}>{m}</button>
                    ))}
                 </div>
            </div>

            <div className="bg-white">
                {/* Table Header Row */}
                <div className="hidden md:grid grid-cols-12 bg-slate-50 border-b border-slate-100 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <div className="col-span-1 p-2 text-center">Icon</div>
                    <div className="col-span-4 p-2 pl-4">Habit Strategy</div>
                    <div className="col-span-2 p-2 text-center">Category</div>
                    <div className="col-span-1 p-2 text-center">Goal</div>
                    <div className="col-span-1 p-2 text-center">Freq</div>
                    <div className="col-span-2 p-2 text-center">Sync Status</div>
                    <div className="col-span-1 p-2 text-center">Exit</div>
                </div>

                {habits.map((h) => {
                    const isActive = (h.activeMonths || []).includes(selectedConfigMonth);
                    return (
                        <div key={h.id} className="grid grid-cols-12 border-b border-slate-100 group hover:bg-slate-50 transition-colors items-center">
                            {/* Icon */}
                            <div className="col-span-2 md:col-span-1 py-3 border-r border-slate-50 flex justify-center">
                                <input 
                                    className="w-8 text-center bg-transparent outline-none text-xl cursor-pointer hover:scale-125 transition-transform" 
                                    value={h.emoji} 
                                    onChange={(e) => onUpdateHabit(h.id, { emoji: e.target.value })} 
                                />
                            </div>
                            
                            {/* Name */}
                            <div className="col-span-10 md:col-span-4 py-2 px-4 md:border-r border-slate-50">
                                <div className="bg-[#FFF7ED] p-2 rounded-xl border border-orange-100/50 group-hover:bg-[#FFEDD5] transition-colors">
                                    <input 
                                        className="w-full text-[11px] font-bold text-slate-700 bg-transparent outline-none placeholder-orange-200" 
                                        value={h.name} 
                                        onChange={(e) => onUpdateHabit(h.id, { name: e.target.value })} 
                                        placeholder="Define Ritual..."
                                    />
                                </div>
                            </div>
                            
                            {/* Category Dropdown */}
                            <div className="col-span-4 md:col-span-2 py-2 px-2 border-r border-slate-50 hidden md:block">
                                <select 
                                    value={h.category}
                                    onChange={(e) => onUpdateHabit(h.id, { category: e.target.value as Habit['category'] })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none focus:border-indigo-400"
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            {/* Goal */}
                            <div className="col-span-1 py-2 px-1 border-r border-slate-50 hidden md:block">
                                <input 
                                    type="number"
                                    className="w-full text-center text-[10px] font-black text-slate-700 bg-transparent outline-none"
                                    value={h.goal}
                                    onChange={(e) => onUpdateHabit(h.id, { goal: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            {/* Freq */}
                            <div className="col-span-1 py-2 px-1 border-r border-slate-50 hidden md:block">
                                <input 
                                    className="w-full text-center text-[10px] font-black text-slate-400 bg-transparent outline-none uppercase"
                                    value={h.frequency}
                                    onChange={(e) => onUpdateHabit(h.id, { frequency: e.target.value })}
                                />
                            </div>

                            {/* Sync Status (Active for month) */}
                            <div className="col-span-9 md:col-span-2 py-2 flex justify-center gap-3 items-center md:border-r border-slate-50">
                                <button 
                                    onClick={() => toggleHabitForMonth(h.id, selectedConfigMonth)} 
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${isActive ? 'bg-[#007ACC] border-[#007ACC] text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-300 hover:border-slate-400'}`}
                                >
                                    <span className="text-[8px] font-black uppercase tracking-widest">{isActive ? 'Synced' : 'Inactive'}</span>
                                    {isActive ? <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg> : <div className="w-2.5 h-2.5 rounded-full border border-slate-200" />}
                                </button>
                            </div>

                            {/* Delete */}
                            <div className="col-span-3 md:col-span-1 py-2 flex justify-center">
                                <button onClick={() => onDeleteHabit(h.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-[#C94C4C] transition-all text-xl font-light">×</button>
                            </div>
                        </div>
                    );
                })}
                
                <div 
                    className="p-4 bg-[#F0F9FF] border-t border-white text-center cursor-pointer hover:bg-[#E0F2FE] transition-all group" 
                    onClick={onAddHabit}
                >
                    <span className="text-[10px] font-black text-[#0369A1] uppercase tracking-[0.4em] group-hover:tracking-[0.6em] transition-all">+ Add New Habit Strategy</span>
                </div>
            </div>
        </div>

        {/* MONTHLY MILESTONES */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Tactical Milestones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.activeMonths.map((month, idx) => {
                    const color = THEME.colors[idx % THEME.colors.length];
                    const mGoals = monthlyGoals.find(m => m.month === month)?.goals || [];
                    return (
                        <div key={month} className="border border-slate-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="px-4 py-2 flex justify-between items-center" style={{ backgroundColor: `${color}15`, borderBottom: `1px solid ${color}30` }}>
                                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: color }}>{month}</span>
                                <button onClick={() => handleAddMonthlyGoal(month)} className="w-5 h-5 rounded bg-white flex items-center justify-center text-[12px] shadow-sm hover:scale-110 transition-transform" style={{ color: color }}>+</button>
                            </div>
                            <div className="p-3 bg-white space-y-2 min-h-[80px]">
                                {mGoals.map((goal, gIdx) => (
                                    <div key={gIdx} className="flex items-start gap-2 group">
                                        <div onClick={() => {
                                            const newGoals = [...mGoals];
                                            newGoals[gIdx].completed = !newGoals[gIdx].completed;
                                            onUpdateMonthlyGoals(month, newGoals);
                                        }} className={`mt-1 w-3 h-3 rounded-[2px] border cursor-pointer flex items-center justify-center transition-all ${goal.completed ? 'border-transparent' : 'border-slate-300 bg-slate-50'}`} style={{ backgroundColor: goal.completed ? color : undefined }}>
                                           {goal.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input className={`flex-1 text-[10px] font-bold bg-transparent outline-none ${goal.completed ? 'text-slate-300 line-through' : 'text-slate-600'}`} value={goal.text} onChange={(e) => {
                                            const newGoals = [...mGoals];
                                            newGoals[gIdx].text = e.target.value;
                                            onUpdateMonthlyGoals(month, newGoals);
                                        }} />
                                        <button 
                                          onClick={() => handleDeleteMonthlyGoal(month, gIdx)}
                                          className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                        >
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};
