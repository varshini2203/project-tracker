import React, { useState, useMemo, useEffect } from 'react';
import { useStore, View, Status, Priority, Task } from './store';
import TaskCard from './TaskCard';
import TaskRow from './TaskRow';

const STATUS_OPTIONS: Status[] = ["To Do", "In Progress", "In Review", "Done"];
const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High", "Critical"];
const ASSIGNEES = ["Sarah", "Marcus", "Lila", "Jordan", "Alex", "Sam"];

const ROW_HEIGHT = 64;
const DAY_WIDTH = 60;
const TIMELINE_BASE = new Date("2026-03-01").getTime();

const THEME: Record<Priority, { border: string; bar: string }> = {
  Critical: { border: "border-red-500", bar: "bg-red-500" },
  High: { border: "border-orange-500", bar: "bg-orange-500" },
  Medium: { border: "border-blue-500", bar: "bg-blue-500" },
  Low: { border: "border-slate-300", bar: "bg-slate-400" },
};

const App: React.FC = () => {
  const { tasks, view, setView, filters, setFilters, clearFilters, updateTask, users, addTask } = useStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium' as Priority, status: 'To Do' as Status });
  const [search, setSearch] = useState("");
  const [scrollTop, setScrollTop] = useState(0);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0, ox: 0, oy: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState<Status | null>(null);

  // ✅ FIXED LIVE SIMULATION
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)]?.id;
      if (!randomTask) return;

      useStore.getState().updateTask(
        randomTask,
        tasks.find(t => t.id === randomTask)?.status || "To Do"
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Drag logic
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      setDragPos(p => ({ ...p, x: e.clientX - p.ox, y: e.clientY - p.oy }));
      const el = document.elementsFromPoint(e.clientX, e.clientY);
      const col = el.find(x => x.hasAttribute('data-status'))?.getAttribute('data-status') as Status;
      setDropTarget(col || null);
    };

    const onUp = () => {
      if (isDragging && draggedTask && dropTarget) {
        updateTask(draggedTask.id, dropTarget);
      }
      setIsDragging(false);
      setDraggedTask(null);
      setDropTarget(null);
    };

    if (isDragging) {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    }

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDragging, draggedTask, dropTarget, updateTask]);

  // Filtering
  const filtered = useMemo(() => tasks.filter(t =>
    (filters.status.length === 0 || filters.status.includes(t.status)) &&
    (filters.priority.length === 0 || filters.priority.includes(t.priority)) &&
    (filters.assignee.length === 0 || filters.assignee.includes(t.assignee)) &&
    (t.title.toLowerCase().includes(search.toLowerCase()))
  ), [tasks, filters, search]);

  const grouped = useMemo(() => {
    const g: Record<Status, Task[]> = { "To Do": [], "In Progress": [], "In Review": [], "Done": [] };
    filtered.forEach(t => g[t.status].push(t));
    return g;
  }, [filtered]);

  // Virtual list
  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
  const displayTasks = useMemo(() => filtered.slice(startIdx, startIdx + 20), [filtered, startIdx]);

  const getDueLabel = (date: string) => {
    const today = new Date("2026-03-25");
    const due = new Date(date);
    const diff = Math.floor((today.getTime() - due.getTime()) / 86400000);
    if (diff === 0) return "Due Today";
    return diff > 0 ? `${diff}d overdue` : "Upcoming";
  };

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">

      {/* HEADER */}
      <header className="px-8 py-4 bg-white border-b flex justify-between items-center shadow-sm">
        <h1 className="font-black text-lg">Velotrack</h1>

        <div className="flex gap-2">
          {(["kanban", "list", "timeline"] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-4 py-1 text-xs font-bold ${view === v ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>
              {v}
            </button>
          ))}
        </div>

        <button onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded">
          + Task
        </button>
      </header>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="p-6 overflow-auto" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
          <div style={{ height: filtered.length * ROW_HEIGHT }}>
            <div style={{ transform: `translateY(${startIdx * ROW_HEIGHT}px)` }}>
              {displayTasks.map(t => (
                <TaskRow key={t.id} task={t} updateTask={updateTask} dueLabel={getDueLabel(t.dueDate)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KANBAN */}
      {view === "kanban" && (
        <div className="flex gap-4 p-6 overflow-auto">
          {STATUS_OPTIONS.map(status => (
            <div key={status} data-status={status} className="w-72 bg-gray-100 p-3 rounded">
              <h3 className="font-bold mb-2">{status}</h3>
              {grouped[status].map(t => (
                <TaskCard key={t.id} task={t}
                  isDragging={draggedTask?.id === t.id}
                  activeUsers={[]}
                  onPointerDown={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setDraggedTask(t);
                    setIsDragging(true);
                    setDragPos({ x: r.left, y: r.top, ox: e.clientX - r.left, oy: e.clientY - r.top });
                  }}
                  dueLabel={getDueLabel(t.dueDate)}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* TIMELINE */}
      {view === "timeline" && (
        <div className="p-6 overflow-auto">
          <div className="relative min-w-max">

            {/* TODAY LINE */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-red-500"
              style={{
                left: (() => {
                  const today = new Date("2026-03-25");
                  const diff = Math.floor((today.getTime() - TIMELINE_BASE) / 86400000);
                  return 256 + diff * DAY_WIDTH;
                })()
              }}
            />

            {filtered.map(t => (
              <div key={t.id} className="flex h-10 border-b">
                <div className="w-64">{t.title}</div>
                <div className="flex-1 relative">
                  <div className={`${THEME[t.priority].bar} absolute h-4 top-3`}
                    style={{
                      left: 0,
                      width: 100
                    }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;