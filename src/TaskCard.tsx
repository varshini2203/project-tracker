import React from "react";
import { Task, Priority } from "./store";

const THEME: Record<Priority, { border: string }> = {
  Critical: { border: "border-red-500" },
  High: { border: "border-orange-500" },
  Medium: { border: "border-blue-500" },
  Low: { border: "border-slate-300" },
};

interface Props {
  task: Task;
  isDragging: boolean;
  activeUsers: { name: string; color: string }[];
  onPointerDown: (e: React.PointerEvent) => void;
  dueLabel: string;
}

const TaskCard: React.FC<Props> = ({ task, isDragging, activeUsers, onPointerDown, dueLabel }) => {
  if (isDragging) {
    return <div className="h-[106px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-100/50" />;
  }

  return (
    <div
      onPointerDown={onPointerDown}
      style={{ touchAction: "none" }}
      className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${THEME[task.priority].border} cursor-grab active:cursor-grabbing hover:shadow-lg transition-all`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{task.title}</h4>
        
        {/* ✅ LIVE INDICATORS (DOTS) */}
        <div className="flex -space-x-1.5 shrink-0">
          {activeUsers.map((u, i) => (
            <div key={i} className={`w-3 h-3 rounded-full border-2 border-white ${u.color} shadow-sm animate-pulse`} title={u.name} />
          ))}
        </div>
      </div>

      <div className="flex justify-between items-end mt-4">
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-slate-400">Assignee</span>
          <span className="text-[10px] font-bold text-slate-600">{task.assignee}</span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[8px] font-black uppercase text-slate-400">Due Date</span>
          <span className={`text-[10px] font-black ${dueLabel.includes('overdue') ? 'text-red-500' : 'text-slate-400'}`}>
            {dueLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TaskCard);