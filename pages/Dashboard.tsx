
import React, { useState, useMemo, useEffect } from 'react';
import { Habit, PlannerConfig } from '../types';
import { WeeklyActivity, ConsistencyRing, RitualBalance } from '../components/ProgressCharts';
import { MONTHS_LIST } from '../constants';

interface DashboardProps {
  habits: Habit[];
  config: PlannerConfig;
  userCreatedAt?: string | null;
  userEmail?: string | null;
  onUpdateConfig: (config: PlannerConfig) => void;
  onAddClick: () => void;
}

const YEARS = ['2024', '2025', '2026', '2027'];

export const Dashboard: React.FC<DashboardProps> = ({ habits, config, userCreatedAt, userEmail, onUpdateConfig }) => {
  const [viewYear, setViewYear] = useState('2026');
  const [viewMonth, setViewMonth] = useState<'Year' | string>('Year');
  const [localManifestation, setLocalManifestation] = useState(config.manifestationText || '');

  // Debounced sync for manifestation board
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localManifestation !== config.manifestationText) {
        onUpdateConfig({ ...config, manifestationText: localManifestation });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [localManifestation]);

  useEffect(() => {
    setLocalManifestation(config.manifestationText || '');
  }, [config.manifestationText]);

  const trialStats = useMemo(() => {
    if (!userCreatedAt) return { remaining: 90, elapsed: 0, percentage: 0 };
    const created = new Date(userCreatedAt);
    const now = new Date();
    const trialDuration = 90; // 3 months
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, trialDuration - elapsedDays);
    const percentage = Math.min(100, Math.round((elapsedDays / trialDuration) * 100));
    return { remaining: remainingDays, elapsed: elapsedDays, percentage };
  }, [userCreatedAt]);

  const performanceMetrics = useMemo(() => {
    if (habits.length === 0) return { rate: 0, count: 0 };
    let totalPossible = 0;
    let totalCompleted = 0;
    const monthsToProcess = viewMonth === 'Year' ? MONTHS_LIST : [viewMonth];
    habits.forEach(habit => {
      monthsToProcess.forEach(month => {
        const history = habit.history[month] || {};
        totalPossible += 31;
        totalCompleted += Object.values(history).filter(Boolean).length;
      });
    });
    const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    return { rate, count: totalCompleted };
  }, [habits, viewMonth]);

  const redirectToWhatsApp = (message: string) => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/918789548725?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-16 pb-48 space-y-10 md:space-y-20 overflow-x-hidden animate-in fade-in duration-1000">
      
      {/* Hero Strategy Control */}
      <section className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8 md:gap-12">
        <div className="w-full max-w-4xl">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="px-4 py-1.5 bg-white border border-gray-100 rounded-full flex items-center gap-3 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76C7C0] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#76C7C0]"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Status: Operational</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-6 italic">
            Life <br/><span className="text-[#76C7C0] not-italic underline decoration-[6px] md:decoration-[12px] decoration-gray-100 underline-offset-[4px] md:underline-offset-[8px]">Architecture.</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-6 mt-6 md:mt-10">
            <div className="flex flex-col gap-1.5 min-w-[120px]">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-60">Cycle Period</label>
              <select 
                value={viewYear}
                onChange={(e) => setViewYear(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest focus:border-gray-900 outline-none transition-all shadow-sm appearance-none cursor-pointer"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-60">Operational Window</label>
              <select 
                value={viewMonth}
                onChange={(e) => setViewMonth(e.target.value)}
                className="w-full bg-white border-2 border-gray-100 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest focus:border-[#76C7C0] outline-none transition-all shadow-sm appearance-none cursor-pointer"
              >
                <option value="Year">Full Annual View</option>
                {MONTHS_LIST.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-6 w-full xl:w-auto">
          <div className="flex-1 min-w-[180px] bg-white border border-gray-100 p-5 md:p-8 rounded-[2rem] flex items-center justify-between gap-6 shadow-sm group hover:border-[#76C7C0]/30 transition-all duration-700">
            <div>
              <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1 italic">Executions</p>
              <p className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter italic group-hover:text-[#76C7C0] transition-colors">{performanceMetrics.count}</p>
            </div>
            <div className="w-10 h-10 md:w-16 md:h-16 bg-[#F1F5F9] text-gray-400 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-700">✓</div>
          </div>
          <div className="flex-1 min-w-[180px] bg-[#111827] p-5 md:p-8 rounded-[2rem] flex items-center justify-between gap-6 shadow-lg relative overflow-hidden group">
            <div className="w-10 h-10 md:w-16 md:h-16 bg-white/5 border border-white/10 text-emerald-400 rounded-xl md:rounded-2xl flex items-center justify-center text-lg md:text-2xl shadow-inner group-hover:scale-110 transition-transform duration-700">🎯</div>
            <div className="text-right">
              <p className="text-[9px] font-black text-emerald-400/50 uppercase tracking-widest mb-1 italic">Ranking</p>
              <p className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase group-hover:text-emerald-400 transition-colors">Elite</p>
            </div>
          </div>
        </div>
      </section>

      {/* Manifestation Board Section */}
      <section className="bg-white border border-gray-100 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-sm relative overflow-hidden group">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-900 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl shadow-xl group-hover:bg-[#76C7C0] transition-colors duration-700">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Manifestation Ledger</h2>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1.5">Architecture Core Protocol</p>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            value={localManifestation}
            onChange={(e) => setLocalManifestation(e.target.value)}
            className="w-full h-40 md:h-72 bg-gray-50/50 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 outline-none focus:bg-white transition-all font-mono text-sm md:text-lg leading-[1.6] text-gray-700 resize-none shadow-none relative z-10 placeholder:text-gray-200"
            placeholder="Write your strategic vision for 2026..."
          />
        </div>
      </section>

      {/* Main Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-stretch">
        <div className="lg:col-span-4 h-full">
          <ConsistencyRing percentage={performanceMetrics.rate} />
        </div>
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 h-full">
          <WeeklyActivity month={viewMonth} habits={habits} />
          <RitualBalance habits={habits} />
        </div>
      </section>

      {/* Evolution Dashboard */}
      <section className="bg-gray-900 border border-white/5 p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] shadow-xl relative overflow-hidden group">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <h3 className="text-[10px] font-black text-[#76C7C0] uppercase tracking-[0.6em] italic">Evolution Sync</h3>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="flex flex-row items-end gap-6 mb-8 md:mb-12">
              <span className="text-6xl sm:text-[8rem] md:text-[10rem] font-black text-white tracking-tighter leading-[0.6] group-hover:text-[#76C7C0] transition-colors duration-1000 italic">42</span>
              <div className="mb-2 md:mb-4">
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] mb-1.5 italic">Rank Tier</p>
                <p className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter italic uppercase">Alpha Architect</p>
              </div>
            </div>

            <div className="w-full h-6 md:h-10 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 mb-8 md:mb-12 relative">
              <div className="h-full bg-gradient-to-r from-[#76C7C0] to-emerald-400 rounded-full transition-all duration-[3000ms] ease-out shadow-[0_0_20px_rgba(118,199,192,0.4)]" style={{ width: '74%' }} />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-white/5 p-6 md:p-8 rounded-[2rem] border border-white/5 backdrop-blur-md gap-6">
              <div className="text-center sm:text-left">
                <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">Integrity Delta</p>
                <p className="text-lg md:text-2xl font-black text-white italic tracking-tight uppercase">Optimal Sync</p>
              </div>
              <button className="bg-[#76C7C0] text-gray-900 px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                Unlock Lv. 43
              </button>
            </div>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className="bg-white/5 p-6 md:p-10 rounded-[2.5rem] text-white relative border border-white/5 transition-all duration-700">
               <h4 className="text-[9px] font-black uppercase tracking-[0.6em] text-[#76C7C0] mb-6 pb-4 border-b border-white/5 italic">Briefing</h4>
               <p className="text-xl sm:text-3xl md:text-4xl font-black italic leading-[1.2] tracking-tighter mb-8">
                 "Architecture fidelity is <span className="text-[#76C7C0]">24.8%</span> above baseline."
               </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 md:p-10 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-md text-center">
                <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Core Integrity</p>
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">99</span>
                  <span className="text-lg md:text-3xl font-black text-[#76C7C0]">.9</span>
                </div>
              </div>
              <div className="p-6 md:p-10 bg-white/5 border border-white/5 rounded-[2rem] backdrop-blur-md text-center">
                <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">Load Profile</p>
                <p className="text-xl md:text-4xl font-black text-white italic tracking-tighter uppercase">Extreme</p>
              </div>
            </div>
          </div> 
        </div>
      </section>

      {/* Trial Integrity Countdown */}
      <section className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm relative overflow-hidden group">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="space-y-3 md:space-y-5 text-center xl:text-left">
            <div>
              <span className="text-[9px] md:text-[10px] font-black text-[#76C7C0] uppercase tracking-[0.4em] mb-1.5 block">Architectural Pass Status</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter italic leading-none">Trial Integrity</h2>
            </div>
            <p className="text-[11px] md:text-sm text-gray-400 font-medium max-w-lg italic">
              Your 90-day complimentary access is active. Maintain permanent sync beyond this window.
            </p>
          </div>

          <div className="w-full xl:max-w-md space-y-4 md:space-y-6">
            <div className="flex justify-between items-end mb-1">
              <div className="space-y-0.5">
                <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">Elapsed</p>
                <p className="text-xl md:text-2xl font-black text-gray-900 italic">{trialStats.elapsed}d</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[8px] md:text-[9px] font-black text-[#76C7C0] uppercase tracking-widest">Remaining</p>
                <p className="text-xl md:text-2xl font-black text-gray-900 italic">{trialStats.remaining}d</p>
              </div>
            </div>
            
            <div className="w-full h-2.5 md:h-3.5 bg-gray-50 rounded-full border border-gray-100 overflow-hidden p-0.5 shadow-inner">
               <div 
                 className="h-full bg-gradient-to-r from-[#76C7C0] to-emerald-400 rounded-full transition-all duration-[2000ms]"
                 style={{ width: `${trialStats.percentage}%` }}
               />
            </div>

            <div className="pt-2 md:pt-4">
              <button 
                onClick={() => redirectToWhatsApp(`Hello! I want to finalize my NextYou21 plan.`)}
                className="w-full bg-gray-900 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
              >
                Finalize Architecture
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
