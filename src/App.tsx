import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useStore, View, Status, Priority, Task } from './store';
import TaskCard from './TaskCard';
import TaskRow from './TaskRow';

const STATUS_OPTIONS: Status[] = ["To Do", "In Progress", "In Review", "Done"];
const PRIORITY_OPTIONS: Priority[] = ["Low", "Medium", "High", "Critical"];
const ASSIGNEES = ["Sarah", "Marcus", "Lila", "Jordan", "Alex", "Sam"];

const ROW_HEIGHT = 64; // Fixed height for virtualization
const DAY_WIDTH = 60;
const TIMELINE_BASE = new Date("2026-03-01").getTime();

const THEME: Record<Priority, { border: string; bar: string; text: string }> = {
  Critical: { border: "border-red-500", bar: "bg-red-500", text: "text-red-700" },
  High: { border: "border-orange-500", bar: "bg-orange-500", text: "text-orange-700" },
  Medium: { border: "border-blue-500", bar: "bg-blue-500", text: "text-blue-700" },
  Low: { border: "border-slate-300", bar: "bg-slate-400", text: "text-slate-600" },
};

const App: React.FC = () => {
  const { tasks, view, setView, filters, setFilters, clearFilters, updateTask, users, addTask } = useStore();
  
  // --- UI STATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'Medium' as Priority, status: 'To Do' as Status });
  const [search, setSearch] = useState("");
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportH, setViewportH] = useState(window.innerHeight);

  // --- DRAG & DROP STATE ---
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0, ox: 0, oy: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dropTarget, setDropTarget] = useState<Status | null>(null);

  // --- 1. LIVE COLLABORATION SIMULATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      const userIds = Object.keys(users);
      const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
      const randomTask = tasks[Math.floor(Math.random() * 20)].id;
      // Accessing vanilla store to update without triggering full App re-render loops
      useStore.getState().updateTask(randomTask, tasks.find(t => t.id === randomTask)?.status || "To Do"); 
    }, 4000);
    return () => clearInterval(interval);
  }, [tasks, users]);

  // --- 2. GLOBAL POINTER EVENTS (For Smooth Drag) ---
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      setDragPos(p => ({ ...p, x: e.clientX - p.ox, y: e.clientY - p.oy }));
      const el = document.elementsFromPoint(e.clientX, e.clientY);
      const col = el.find(x => x.hasAttribute('data-status'))?.getAttribute('data-status') as Status;
      setDropTarget(col || null);
    };
    const onUp = () => {
      if (isDragging && draggedTask && dropTarget) updateTask(draggedTask.id, dropTarget);
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

  // --- 3. FILTERING LOGIC ---
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

  // --- 4. VIRTUALIZATION CALCS (List View) ---
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
    <div className="h-screen w-full bg-[#F8FAFC] flex flex-col font-sans overflow-hidden select-none">
      
      {/* HEADER & LIVE PRESENCE */}
      <header className="px-8 py-4 bg-white border-b flex justify-between items-center z- shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg">V</div>
            <h1 className="text-xl font-black italic text-slate-800 uppercase tracking-tighter">Velotrack</h1>
          </div>

          <div className="flex -space-x-2 border-l pl-8">
            {Object.values(users).map((u) => (
              <div key={u.id} className={`w-8 h-8 rounded-full border-2 border-white ${u.color} flex items-center justify-center text-[10px] text-white font-black shadow-sm relative group`}>
                {u.name}
                <span className="absolute -bottom-8 bg-slate-800 text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">{u.name} (Active)</span>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        
        <nav className="flex bg-slate-100 p-1 rounded-xl border">
          {(["kanban", "list", "timeline"] as View[]).map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${view === v ? "bg-white shadow-sm text-indigo-600" : "text-slate-400"}`}>{v}</button>
          ))}
        </nav>

        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase shadow-lg hover:bg-indigo-700 transition-all active:scale-95">+ Create Task</button>
      </header>

      {/* FILTER STRIP */}
      <div className="bg-white px-8 py-3 border-b flex flex-wrap gap-6 items-center z-40">
        <div className="relative">
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-slate-50 border rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 w-56 font-medium" />
          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
        </div>

        <select 
          className="bg-slate-50 border text-[10px] font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
          value={filters.assignee || ""}
          onChange={(e) => setFilters({ assignee: e.target.value ? [e.target.value] : [] })}
        >
          <option value="">All Assignees</option>
          {ASSIGNEES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <div className="flex gap-2 items-center border-l pl-6">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Priority:</span>
          {PRIORITY_OPTIONS.map(p => (
            <button key={p} onClick={() => setFilters({ priority: filters.priority.includes(p) ? filters.priority.filter(x => x !== p) : [...filters.priority, p] })}
            className={`px-3 py-1 rounded-md text-[9px] font-bold border transition-all ${filters.priority.includes(p) ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 hover:border-slate-400'}`}>{p}</button>
          ))}
        </div>

        <button onClick={clearFilters} className="text-[10px] font-black text-indigo-600 uppercase hover:underline ml-auto">Reset Filters</button>
      </div>

      <main className="flex-1 p-8 overflow-hidden relative">
        {/* KANBAN VIEW */}
        {view === "kanban" && (
          <div className="flex gap-8 h-full overflow-x-auto pb-4 custom-scrollbar">
            {STATUS_OPTIONS.map(status => (
              <div key={status} data-status={status} className={`min-w-[320px] flex-1 flex flex-col rounded-2xl transition-all duration-300 ${dropTarget === status ? "bg-indigo-100 border-2 border-indigo-400 scale-[1.01]" : "bg-slate-200/40"}`}>
                <div className="p-5 font-black text-[11px] uppercase text-slate-500 flex justify-between items-center">
                  <span>{status}</span>
                  <span className="bg-white/50 px-2 py-0.5 rounded-full text-[9px]">{grouped[status].length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {grouped[status].length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/30">Empty Column</div>
                  ) : (
                    grouped[status].map(t => (
                      <TaskCard 
                        key={t.id} task={t} isDragging={draggedTask?.id === t.id}
                        activeUsers={Object.values(users).filter(u => u.taskId === t.id)}
                        onPointerDown={(e) => {
                          const r = e.currentTarget.getBoundingClientRect();
                          setDraggedTask(t); setIsDragging(true);
                          setDragPos({ x: r.left, y: r.top, ox: e.clientX - r.left, oy: e.clientY - r.top });
                        }}
                        dueLabel={getDueLabel(t.dueDate)}
                      />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIST VIEW (Virtualization Fixed) */}
        {view === "list" && (
          <div className="bg-white rounded-2xl border shadow-xl h-full flex flex-col overflow-hidden">
            <div className="grid grid-cols-5 px-8 py-5 border-b bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest z-10">
              <div className="col-span-2">Task Details</div>
              <div>Priority</div>
              <div>Status</div>
              <div className="text-right">Due Date</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
              <div style={{ height: filtered.length * ROW_HEIGHT, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${startIdx * ROW_HEIGHT}px)` }}>
                  {displayTasks.map(t => (
                    <TaskRow key={t.id} task={t} updateTask={updateTask} dueLabel={getDueLabel(t.dueDate)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {view === "timeline" && (
          <div className="bg-white rounded-2xl border h-full overflow-auto shadow-xl custom-scrollbar">
             <div className="relative min-w-max" style={{ width: (DAY_WIDTH * 60) + 256 }}>
              {/* TODAY LINE */}
<div
  className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20"
  style={{
    left: (() => {
      const today = new Date("2026-03-25");
      const diff = Math.floor((today.getTime() - TIMELINE_BASE) / 86400000);
      return 256 + diff * DAY_WIDTH;
    })()
  }}
/>
                <div className="flex bg-slate-50 sticky top-0 z-20 border-b">
                  <div className="w-64 border-r p-4 text-[10px] font-black uppercase text-slate-400 sticky left-0 bg-slate-50">Sprint Planner</div>
                  {Array.from({length: 60}).map((_, i) => (
                    <div key={i} style={{ width: DAY_WIDTH }} className="text-center p-4 border-r text-[9px] font-black text-slate-400 shrink-0">MAR {i+1}</div>
                  ))}
                </div>
                {filtered.map(t => {
                  const sD = Math.floor((new Date(t.startDate).getTime() - TIMELINE_BASE) / 86400000);
                  const dD = Math.floor((new Date(t.dueDate).getTime() - TIMELINE_BASE) / 86400000);
                  return (
                    <div key={t.id} className="flex border-b h-12 items-center hover:bg-slate-50 group">
                      <div className="w-64 border-r px-5 text-[10px] font-bold text-slate-600 truncate sticky left-0 bg-white z-10 italic">#{t.id} {t.title}</div>
                      <div className="relative h-full flex-1">
                        <div className={`absolute top-3 bottom-3 rounded-full ${THEME[t.priority].bar} opacity-60 group-hover:opacity-100 transition-opacity`} 
                          style={{ left: sD * DAY_WIDTH, width: Math.max(12, (dD - sD + 1) * DAY_WIDTH) }} 
                        />
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}

        {/* DRAG PREVIEW */}
        {isDragging && draggedTask && (
          <div className="fixed z- pointer-events-none shadow-2xl" style={{ left: dragPos.x, top: dragPos.y, width: '280px', transform: 'rotate(2deg) scale(1.05)' }}>
            <div className={`bg-white p-4 rounded-xl border-l-4 ${THEME[draggedTask.priority].border} opacity-95`}>
               <h4 className="text-sm font-black text-slate-800 truncate">{draggedTask.title}</h4>
               <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">Releasing to {dropTarget || '...'}</p>
            </div>
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              if (!newTask.title) return;
              addTask({...newTask, id: Date.now(), assignee: 'Alex', startDate: '2026-03-25', dueDate: '2026-03-31'}); 
              setShowAddModal(false);
              setNewTask({ title: '', priority: 'Medium', status: 'To Do' });
            }} 
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-in zoom-in duration-200"
          >
            <h2 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight italic">New Task</h2>
            <div className="space-y-4">
              <input autoFocus placeholder="What needs to be done?" className="w-full p-4 bg-slate-50 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 px-1">Priority</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as Priority})}>
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 px-1">Initial Status</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl font-bold text-xs" value={newTask.status} onChange={e => setNewTask({...newTask, status: e.target.value as Status})}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 p-4 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
              <button type="submit" className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase shadow-lg shadow-indigo-100">Create Task</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
