import React from "react";
import { Task } from "./data";

interface Props { tasks: Task[]; getPriorityColor: (p: string) => string; }

const TimelineView: React.FC<Props> = ({ tasks, getPriorityColor }) => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar">
      <div className="min-w-[1200px] p-8">
        <div className="flex border-b border-slate-100 pb-4 mb-6 sticky top-0 bg-white z-20">
          {days.map(d => (
            <div key={d} className={`flex-1 text-center text-[10px] font-black ${d === today.getDate() ? 'text-indigo-600' : 'text-slate-300'}`}>
              {d}
            </div>
          ))}
        </div>
        <div className="space-y-3 relative">
          <div className="absolute top-0 bottom-0 w-px bg-indigo-500 z-10 opacity-20" style={{ left: `${((today.getDate()-1)/daysInMonth)*100}%` }} />
          {tasks.slice(0, 40).map(task => {
            const startDay = new Date(task.dueDate).getDate();
            const endDay = new Date(task.dueDate).getDate();
            const duration = Math.max(1, endDay - startDay + 1);
            return (
              <div key={task.id} className="h-7 relative group">
                <div className={`${getPriorityColor(task.priority)} h-5 rounded-md opacity-80 flex items-center px-2 shadow-sm`}
                  style={{ position: 'absolute', left: `${((startDay-1)/daysInMonth)*100}%`, width: `${(duration/daysInMonth)*100}%` }}>
                  <span className="text-[8px] text-white font-bold truncate">{task.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;