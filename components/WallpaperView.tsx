
import React, { useState, useEffect, useMemo } from 'react';
import { Habit } from '../types';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis 
} from 'recharts';
import { MONTHS_LIST } from '../constants';
import { getHabitInsights } from '../services/geminiService';

interface WallpaperViewProps {
  habits: Habit[];
  month: string;
}

export const WallpaperView: React.FC<WallpaperViewProps> = ({ habits, month }) => {
  const [time, setTime] = useState(new Date());
  const [insight, setInsight] = useState("Initializing strategic analysis...");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadInsight = async () => {
      const text = await getHabitInsights(habits);
      setInsight(text);
    };
    loadInsight();
  }, [habits]);

  const stats = useMemo(() => {
    const today = time.getDate();
    const todayActive = habits.filter(h => h.activeMonths.includes(month));
    const todayDone = todayActive.filter(h => h.history[month]?.[today]).length;
    const efficiency = todayActive.length > 0 ? Math.round((todayDone / todayActive.length) * 100) : 0;

    const categories = ['Mind', 'Body', 'Spirit', 'Work'];
    const balanceData = categories.map(cat => {
      const catHabits = habits.filter(h => h.category === cat);
      const done = catHabits.reduce((acc, h) => acc + Object.values(h.history[month] || {}).filter(Boolean).length, 0);
      const possible = Math.max(1, catHabits.length * 31);
      return { subject: cat, A: Math.round((done / possible) * 100), fullMark: 100 };
    });

    const weeklyTrend = [0, 1, 2, 3, 4, 5, 6].map(offset => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - offset));
      const dateNum = d.getDate();
      const mName = MONTHS_LIST[d.getMonth()];
      const done = habits.filter(h => h.history[mName]?.[dateNum]).length;
      return { name: d.toLocaleDateString('en-US', { weekday: 'narrow' }), count: done };
    });

    return { efficiency, balanceData, weeklyTrend, activeCount: todayActive.length, doneCount: todayDone };
  }, [habits, month, time]);

  return (
    <div className="fixed inset-0 bg-[#020617] text-white z-[40] flex flex-col p-8 md:p-12 overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#76C7C0]/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* TACTICAL CLOCK */}
      <header className="relative z-10 flex flex-col items-center justify-center mb-12">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter italic leading-none text-white/90">
          {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
        </h1>
        <div className="flex items-center gap-4 mt-4">
          <div className="h-px w-8 bg-indigo-500/50" />
          <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] text-indigo-400 italic">
            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <div className="h-px w-8 bg-indigo-500/50" />
        </div>
      </header>

      {/* MAIN DATA GRID */}
      <div className="flex-1 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* LEFT: Balance Radar */}
        <div className="lg:col-span-3 h-full flex flex-col justify-center bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/5">
           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 italic text-center">Biometric Equilibrium</h3>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.balanceData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} />
                  <Radar name="Balance" dataKey="A" stroke="#76C7C0" fill="#76C7C0" fillOpacity={0.2} animationDuration={2500} />
                </RadarChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* CENTER: Efficiency Pulse */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center py-10">
           <div className="relative w-full aspect-square max-w-[400px]">
              {/* Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="100" stroke="#ffffff05" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="120" cy="120" r="100" 
                  stroke="url(#wallpaperGrad)" strokeWidth="8" fill="transparent"
                  strokeDasharray="628" 
                  strokeDashoffset={628 - (628 * stats.efficiency / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-[3000ms] ease-out shadow-2xl"
                />
                <defs>
                  <linearGradient id="wallpaperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#76C7C0" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] mb-4 italic">Daily Velocity</p>
                <div className="flex items-baseline">
                  <span className="text-9xl font-black italic tracking-tighter text-white">{stats.efficiency}</span>
                  <span className="text-3xl font-black text-[#76C7C0] mb-2">%</span>
                </div>
                <div className="mt-4 px-4 py-1.5 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#76C7C0]">
                  {stats.doneCount} / {stats.activeCount} Rituals
                </div>
              </div>
           </div>
        </div>

        {/* RIGHT: Weekly Trend */}
        <div className="lg:col-span-3 h-full flex flex-col justify-center bg-white/5 backdrop-blur-3xl rounded-[3rem] p-8 border border-white/5">
           <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 italic text-center">Tactical Flow</h3>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.weeklyTrend}>
                  <defs>
                    <linearGradient id="wallTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Area type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={4} fill="url(#wallTrend)" animationDuration={3000} />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center mt-4">7-Day Deployment History</p>
        </div>
      </div>

      {/* STRATEGIC INSIGHT FOOTER */}
      <footer className="relative z-10 mt-12 bg-white/5 border border-white/5 p-8 rounded-[3rem] backdrop-blur-2xl">
         <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-[#76C7C0] text-gray-900 flex items-center justify-center text-2xl font-black shadow-lg shadow-[#76C7C0]/20">
               ⚡
            </div>
            <div className="flex-1">
               <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1 italic">Architect Briefing</p>
               <p className="text-2xl font-black italic tracking-tight text-white/90">
                 "{insight}"
               </p>
            </div>
         </div>
      </footer>
    </div>
  );
};
