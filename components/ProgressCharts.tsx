
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, ResponsiveContainer, Tooltip, 
  Radar, RadarChart, PolarGrid, PolarAngleAxis
} from 'recharts';
import { MONTHS_LIST } from '../constants';
import { Habit } from '../types';

export const WeeklyActivity: React.FC<{ month?: string; habits: Habit[] }> = ({ month = 'Year', habits }) => {
  const chartData = useMemo(() => {
    if (month === 'Year') {
      return MONTHS_LIST.map(m => {
        let completions = 0;
        habits.forEach(h => {
          completions += Object.values(h.history[m] || {}).filter(Boolean).length;
        });
        return { name: m.slice(0, 3).toUpperCase(), count: completions };
      });
    } else {
      return [
        { name: 'W1', count: 0 },
        { name: 'W2', count: 0 },
        { name: 'W3', count: 0 },
        { name: 'W4', count: 0 },
      ].map((week, idx) => {
        let weekCompletions = 0;
        const startDay = idx * 7 + 1;
        const endDay = (idx + 1) * 7;
        habits.forEach(h => {
          const history = h.history[month] || {};
          for (let d = startDay; d <= endDay; d++) {
            if (history[d]) weekCompletions++;
          }
        });
        return { ...week, count: weekCompletions };
      });
    }
  }, [month, habits]);

  return (
    <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-[2rem] h-full transition-all hover:shadow-lg duration-500 group flex flex-col overflow-hidden shadow-sm">
      <div className="flex justify-between items-start mb-4 md:mb-6">
        <div>
          <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-0.5">Ritual Flow</h3>
          <p className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter italic leading-none">{month === 'Year' ? 'Annual Velocity' : `${month.slice(0,3)} Telemetry`}</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">📈</div>
      </div>
      <div className="flex-1 min-h-[140px] md:min-h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 7, fontWeight: 800 }} 
              dy={5} 
            />
            <Tooltip 
              cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding: '8px', background: '#fff' }}
              itemStyle={{ fontWeight: '900', color: '#1e293b', fontSize: '9px' }}
              labelStyle={{ display: 'none' }}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#6366F1" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#flowGrad)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const RitualBalance: React.FC<{ habits: Habit[] }> = ({ habits }) => {
  const categories = ['Mind', 'Body', 'Spirit', 'Work'];
  const data = categories.map(cat => ({
    subject: cat,
    A: habits.filter(h => h.category === cat).length * 20 + habits.filter(h => h.category === cat && h.completed).length * 20 + 20,
    fullMark: 150,
  }));

  return (
    <div className="bg-white border border-gray-100 p-5 md:p-6 rounded-[2rem] h-full transition-all hover:shadow-lg duration-500 group flex flex-col overflow-hidden shadow-sm">
       <div className="flex justify-between items-start mb-4 md:mb-6">
        <div>
          <h3 className="text-[8px] font-black uppercase tracking-[0.3em] text-teal-500 mb-0.5">Equilibrium</h3>
          <p className="text-lg md:text-2xl font-black text-gray-900 tracking-tighter italic leading-none">Bio Balance</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg">🧿</div>
      </div>
      <div className="flex-1 min-h-[140px] md:min-h-[160px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data}>
            <PolarGrid stroke="#F1F5F9" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 7, fontWeight: 800, letterSpacing: '0.1em' }} />
            <Radar
              name="Balance"
              dataKey="A"
              stroke="#14B8A6"
              strokeWidth={1.5}
              fill="#14B8A6"
              fillOpacity={0.2}
              animationDuration={2000}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const ConsistencyRing: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 80;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const percentile = useMemo(() => {
    if (percentage === 0) return 0.2;
    if (percentage === 100) return 99.9;
    return Math.min(99.8, (percentage * 0.95) + 5.2);
  }, [percentage]);

  return (
    <div className="bg-[#111827] p-5 md:p-8 rounded-[2rem] flex flex-col items-center justify-between transition-all hover:shadow-xl border border-gray-800/40 relative overflow-hidden group h-full">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#76C7C0]/5 to-transparent pointer-events-none" />
      
      <h3 className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-[0.6em] mb-6 relative z-10">Fidelity</h3>
      
      <div className="relative w-full aspect-square max-w-[160px] md:max-w-[220px] flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
          <circle
            cx="120" cy="120" r={radius}
            stroke="#1f2937" strokeWidth={strokeWidth} fill="transparent"
          />
          <circle
            cx="120" cy="120" r={radius}
            stroke="url(#architectGradMainDash)" strokeWidth={strokeWidth} fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-[2500ms] ease-out"
          />
          <defs>
            <linearGradient id="architectGradMainDash" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#76C7C0" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hero Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-20">
           <div className="flex items-end justify-center">
             <span className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none italic">
               {percentage}
             </span>
             <span className="text-sm md:text-xl font-black text-[#76C7C0] mb-0.5 md:mb-1.5 ml-0.5">%</span>
           </div>
           
           <div className="mt-1.5 px-1.5 py-0.5 bg-teal-500 text-gray-900 rounded text-[7px] font-black uppercase tracking-widest">
              {percentage > 90 ? 'Elite' : 'Active'}
           </div>
        </div>
      </div>

      <div className="w-full mt-6 md:mt-8 relative z-10">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex justify-between items-center mb-1.5 md:mb-2">
            <p className="text-[7px] md:text-[8px] font-black text-gray-500 uppercase tracking-widest italic">Standing</p>
          </div>
          
          <div className="space-y-0.5">
            <p className="text-base md:text-xl font-black text-white italic leading-tight">
              Top <span className="text-[#76C7C0]">{(100 - percentile).toFixed(1)}%</span>
            </p>
            <p className="text-[7px] md:text-[8px] font-bold text-gray-400 uppercase tracking-tight">
              Operational Tier
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
