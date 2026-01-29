import React, { useState, useEffect, useMemo } from 'react';
import { Habit } from '../types';
import { MONTHS_LIST } from '../constants';

interface WallpaperViewProps {
  habits: Habit[];
}

export const WallpaperView: React.FC<WallpaperViewProps> = ({ habits }) => {
  const [time, setTime] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  // 1. Handle Screen Resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Data Processing Engine
  const { points, stats } = useMemo(() => {
    const year = new Date().getFullYear();
    const today = new Date();
    const startOfYear = new Date(year, 0, 1);
    const dayOffset = startOfYear.getDay(); // 0 = Sun
    
    let totalScore = 0;
    let daysCounted = 0;
    const dataPoints = [];

    const d = new Date(year, 0, 1);
    
    while (d.getFullYear() === year) {
        const diff = d.getTime() - startOfYear.getTime();
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
        
        // Grid Logic
        const colIndex = Math.floor((dayOfYear + dayOffset - 1) / 7);
        const rowIndex = d.getDay();

        // Stats
        const monthName = MONTHS_LIST[d.getMonth()];
        const dayNum = d.getDate();
        const activeHabits = habits.filter(h => h.activeMonths.includes(monthName));
        const completedCount = activeHabits.filter(h => h.history[monthName]?.[dayNum]).length;
        const activeCount = activeHabits.length;
        const ratio = activeCount > 0 ? completedCount / activeCount : 0;
        
        const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
        const isFuture = d > today;

        if (d <= today && activeCount > 0) {
            totalScore += ratio;
            daysCounted++;
        }

        dataPoints.push({
            dayOfYear,
            dayNum,
            monthName,
            ratio,
            isToday,
            isFuture,
            colIndex,
            rowIndex
        });

        d.setDate(d.getDate() + 1);
    }

    const efficiency = daysCounted > 0 ? Math.round((totalScore / daysCounted) * 100) : 0;
    
    // Days Remaining Calculation
    const endOfYear = new Date(year, 11, 31);
    const timeDiff = endOfYear.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const daysPassed = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

    return { points: dataPoints, stats: { efficiency, daysRemaining, daysPassed } };
  }, [habits, time]);

  // 4. SVG Config
  const CELL_SIZE = 12;
  const GAP = 2;
  const RADIUS = 6;
  
  // Adaptive ViewBox
  const width = isMobile ? 27 * (CELL_SIZE + GAP) : 53 * (CELL_SIZE + GAP);
  const height = isMobile ? 16 * (CELL_SIZE + GAP) : 7 * (CELL_SIZE + GAP);

  const getPosition = (col: number, row: number) => {
    if (!isMobile) {
        return { x: col * (CELL_SIZE + GAP), y: row * (CELL_SIZE + GAP) };
    } else {
        const isSecondHalf = col >= 27;
        const mobileCol = isSecondHalf ? col - 27 : col;
        const yOffset = isSecondHalf ? (8 * (CELL_SIZE + GAP)) : 0; 
        return { x: mobileCol * (CELL_SIZE + GAP), y: row * (CELL_SIZE + GAP) + yOffset };
    }
  };

  const getColors = (p: any) => {
    if (p.isFuture) return { fill: '#0f0f10', text: '#3f3f46', stroke: '#27272a' }; // Almost black
    if (p.isToday) return { fill: '#ffffff', text: '#000000', stroke: '#ffffff' }; // White
    
    if (p.ratio === 0) return { fill: '#27272a', text: '#52525b', stroke: 'none' };
    if (p.ratio < 0.5) return { fill: '#1e3a8a', text: '#93c5fd', stroke: 'none' }; // Dark Blue
    if (p.ratio < 0.8) return { fill: '#2563eb', text: '#ffffff', stroke: 'none' }; // Blue
    return { fill: '#06b6d4', text: '#000000', stroke: 'none' }; // Cyan
  };

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050505] text-white font-sans flex flex-col p-4 md:p-6 overflow-hidden select-none">
      
      {/* --- TOP BAR (DASHBOARD) --- */}
      <header className="flex-none grid grid-cols-3 items-end pb-4 border-b border-[#222] mb-4">
         
         {/* LEFT: Date & Year */}
         <div className="flex flex-col justify-end">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-white">
                {time.getFullYear()}
            </h1>
            <div className="text-xs md:text-sm font-bold text-neutral-500 uppercase tracking-widest mt-1">
                {time.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
            </div>
         </div>

         {/* CENTER: Time (Hidden on very small screens, centered on desktop) */}
         <div className="flex flex-col items-center justify-end">
            <div className="text-3xl md:text-5xl font-mono font-medium text-white tabular-nums tracking-tight leading-none">
                {time.toLocaleTimeString('en-US', { hour12: false })}
            </div>
            <div className="text-[10px] md:text-xs font-bold text-cyan-500 uppercase tracking-widest mt-1 animate-pulse">
                System Active
            </div>
         </div>

         {/* RIGHT: Stats */}
         <div className="flex flex-col items-end justify-end">
             {/* Countdown */}
            <div className="flex items-baseline gap-1">
                <span className="text-2xl md:text-4xl font-bold text-white tabular-nums leading-none">
                    {stats.daysRemaining}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-neutral-500 uppercase">Days Left</span>
            </div>
            
            {/* Efficiency */}
            <div className="flex items-center gap-2 mt-1">
                <div className="h-1 w-12 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400" style={{ width: `${stats.efficiency}%` }}></div>
                </div>
                <div className="text-[10px] md:text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {stats.efficiency}% Efficiency
                </div>
            </div>
         </div>
      </header>

      {/* --- SVG GRID --- */}
      <main className="flex-1 w-full h-full flex items-center justify-center min-h-0 relative">
        <svg 
            viewBox={`0 0 ${width} ${height}`} 
            preserveAspectRatio="xMidYMid meet" 
            className="w-full h-full max-h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.05)]"
        >
            {points.map((p, i) => {
                const pos = getPosition(p.colIndex, p.rowIndex);
                const colors = getColors(p);
                
                return (
                    <g key={i} className="group transition-all duration-300">
                        {/* Circle */}
                        <circle 
                            cx={pos.x + RADIUS} 
                            cy={pos.y + RADIUS} 
                            r={RADIUS} 
                            fill={colors.fill}
                            stroke={colors.stroke}
                            strokeWidth={0.5}
                            className={`transition-all duration-500 ${p.isToday ? 'animate-pulse' : ''}`}
                        />
                        
                        {/* Day Number (1-365) */}
                        <text 
                            x={pos.x + RADIUS} 
                            y={pos.y + RADIUS} 
                            dy="0.35em" 
                            textAnchor="middle" 
                            fontSize={p.dayOfYear > 99 ? "4.5" : "5.5"}
                            fill={colors.text}
                            fontWeight="800"
                            style={{ pointerEvents: 'none' }}
                        >
                            {p.dayOfYear}
                        </text>

                        {/* Tooltip Trigger Area */}
                        <rect x={pos.x} y={pos.y} width={CELL_SIZE} height={CELL_SIZE} fill="transparent" />
                        
                        {/* SVG Tooltip */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                             <rect 
                                x={pos.x - 24} 
                                y={pos.y - 20} 
                                width="60" 
                                height="16" 
                                rx="3" 
                                fill="#111" 
                                stroke="#333"
                                strokeWidth="0.5"
                             />
                             <text x={pos.x + 6} y={pos.y - 9} fontSize="6" fill="#fff" textAnchor="middle" fontWeight="bold">
                                {p.monthName.substring(0,3)} {p.dayNum} • {Math.round(p.ratio*100)}%
                             </text>
                        </g>
                    </g>
                );
            })}
        </svg>
      </main>

      {/* --- FOOTER (Minimal Legend) --- */}
      <footer className="flex-none pt-2 flex justify-center items-center">
         <div className="flex items-center gap-3 bg-[#111] border border-[#222] px-4 py-1 rounded-full">
            <span className="text-[9px] font-bold uppercase text-neutral-500">Less</span>
            <div className="flex gap-1">
               <div className="w-2 h-2 rounded-full bg-[#27272a]" />
               <div className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
               <div className="w-2 h-2 rounded-full bg-[#2563eb]" />
               <div className="w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
            </div>
            <span className="text-[9px] font-bold uppercase text-neutral-500">More</span>
         </div>
      </footer>
    </div>
  );
};