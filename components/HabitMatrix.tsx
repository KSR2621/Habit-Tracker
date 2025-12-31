
import React from 'react';
import { Habit, WeeklyGoal } from '../types.ts';
import { MONTHS_LIST } from '../constants.tsx';

interface HabitMatrixProps {
  month: string;
  year: string;
  habits: Habit[];
  weeklyGoals: WeeklyGoal[];
  onUpdateWeeklyGoalStatus: (weekIdx: number, goalIdx: number, completed: boolean) => void;
  onToggleCell: (habitId: string, day: number) => void;
}

export const HabitMatrix: React.FC<HabitMatrixProps> = ({ 
  month, 
  year,
  habits, 
  weeklyGoals, 
  onUpdateWeeklyGoalStatus,
  onToggleCell 
}) => {
  const monthIndex = MONTHS_LIST.indexOf(month);
  const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const getWeekdayInitial = (day: number) => {
    const date = new Date(parseInt(year), monthIndex, day);
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return dayNames[date.getDay()];
  };

  const getDayProgress = (day: number) => {
    const total = habits.length;
    const completed = habits.filter(h => h.history[month]?.[day]).length;
    return Math.round((completed / total) * 100) || 0;
  };

  return (
    <div className="space-y-6 md:space-y-12">
      <div className="text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-700 tracking-[0.1em] uppercase">{month} {year}</h2>
        <div className="w-24 md:w-40 h-1 bg-[#76C7C0] mx-auto mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
        {/* Weekly Focus Sidebar */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-gray-900 text-white p-6 rounded shadow-lg">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-6">Current Sprints</h3>
              <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar">
                 {[0, 1, 2, 3, 4].map(weekIdx => {
                   const weekData = weeklyGoals.find(w => w.weekIndex === weekIdx);
                   if (!weekData || weekData.goals.length === 0) return null;
                   
                   return (
                     <div key={weekIdx} className="border-b border-gray-800 pb-4 last:border-none">
                        <div className="flex justify-between mb-3 items-center">
                          <span className="text-[9px] font-black uppercase text-gray-500 italic">Week {weekIdx + 1}</span>
                          <span className="text-[8px] font-bold text-emerald-400">
                            {weekData.goals.filter(g => g.completed).length}/{weekData.goals.length}
                          </span>
                        </div>
                        <ul className="space-y-2">
                           {weekData.goals.map((goal, gIdx) => (
                             <li 
                              key={gIdx} 
                              className="flex items-start gap-2 group cursor-pointer active:opacity-60"
                              onClick={() => onUpdateWeeklyGoalStatus(weekIdx, gIdx, !goal.completed)}
                             >
                                <div className={`w-4 h-4 border rounded-sm flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-700'}`}>
                                  {goal.completed && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-[11px] leading-tight ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{goal.text}</span>
                             </li>
                           ))}
                        </ul>
                     </div>
                   );
                 })}
              </div>
           </div>
        </div>

        {/* Main Grid View */}
        <div className="lg:col-span-9 relative">
          <div className="overflow-x-auto habit-grid-scroll border border-gray-300 rounded shadow-sm bg-white">
            <table className="spreadsheet-grid">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-[#F1F1EB] z-10 border-r-2 min-w-[150px] md:min-w-[220px] py-4 text-[10px] md:text-[12px] font-black text-gray-500 uppercase tracking-widest">Daily Habits</th>
                  {days.map((day) => (
                    <th key={day} className="px-1 py-3 min-w-[36px] md:min-w-[40px]">
                      <div className="text-[8px] text-gray-400 font-bold mb-1">{getWeekdayInitial(day)}</div>
                      <div className="text-[10px] md:text-[12px] font-black text-gray-700">{day}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id}>
                    <td className="sticky left-0 bg-white z-10 text-[11px] md:text-[12px] py-3 md:py-4 border-r-2 border-gray-200 font-bold text-gray-700">
                      <div className="flex items-start gap-2 md:gap-3 pl-2 md:pl-4">
                        <span className="text-base md:text-lg mt-0.5">{habit.emoji}</span>
                        <span className="whitespace-normal leading-tight text-left break-words">{habit.name}</span>
                      </div>
                    </td>
                    {days.map(day => {
                      const isActive = habit.history[month]?.[day];
                      return (
                        <td 
                          key={day} 
                          className={`checkbox-cell p-0 h-[44px] md:h-[46px] min-w-[36px] md:min-w-[40px] ${isActive ? 'active' : ''}`}
                          onClick={() => onToggleCell(habit.id, day)}
                        >
                          <div className="flex items-center justify-center w-full h-full">
                            {isActive ? (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <div className="w-4 h-4 border border-gray-300 rounded-sm bg-white" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className="sticky left-0 bg-gray-50 z-10 text-[8px] md:text-[9px] font-black uppercase text-gray-400 pl-2 md:pl-4 py-3">Score (%)</td>
                  {days.map(day => (
                    <td key={day} className="py-2">
                       <div className="flex flex-col items-center gap-1">
                          <div className="w-[14px] md:w-[18px] h-10 md:h-12 bg-gray-200 rounded-sm relative overflow-hidden">
                            <div 
                              className="absolute bottom-0 left-0 right-0 bg-[#76C7C0] transition-all duration-500"
                              style={{ height: `${getDayProgress(day)}%` }}
                            />
                          </div>
                          <span className="text-[7px] md:text-[8px] font-black text-gray-500">{getDayProgress(day)}%</span>
                       </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-center md:justify-end gap-4 md:gap-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-[#76C7C0] rounded-sm flex items-center justify-center">
                   <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Done</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-gray-300 rounded-sm bg-white" />
                <span>Wait</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
