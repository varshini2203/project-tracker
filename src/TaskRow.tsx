import React from "react";
import { Task, Status, Priority } from "./store";

const THEME: Record<Priority, { bg: string; text: string }> = {
  Critical: { bg: "bg-red-50", text: "text-red-700" },
  High: { bg: "bg-orange-50", text: "text-orange-700" },
  Medium: { bg: "bg-blue-50", text: "text-blue-700" },
  Low: { bg: "bg-slate-50", text: "text-slate-600" },
};

interface RowProps {
  task: Task;
  updateTask: (id: number, status: Status) => void;
  dueLabel: string; // ✅ Fixed: Added missing prop
}

const TaskRow: React.FC<RowProps> = ({ task, updateTask, dueLabel }) => {
  return (
    <div className="grid grid-cols-5 px-8 h-[60px] items-center border-b hover:bg-slate-50 transition-colors">
      <div className="col-span-2 truncate font-bold text-xs text-slate-700 italic">#{task.id} {task.title}</div>
      <div>
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${THEME[task.priority].bg} ${THEME[task.priority].text}`}>
          {task.priority}
        </span>
      </div>
      <div className="pr-4">
        <select
          value={task.status}
          onChange={(e) => updateTask(task.id, e.target.value as Status)}
          className="bg-white border text-[10px] font-bold text-slate-600 rounded-lg px-2 py-1 outline-none w-full"
        >
          {["To Do", "In Progress", "In Review", "Done"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className={`text-right font-bold text-[10px] tabular-nums ${dueLabel.includes("overdue") ? "text-red-500" : "text-slate-400"}`}>
        {dueLabel}
      </div>
    </div>
  );
};

export default TaskRow;