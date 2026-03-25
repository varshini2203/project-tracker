import { create } from 'zustand';

export type Status = "To Do" | "In Progress" | "In Review" | "Done";
export type Priority = "Low" | "Medium" | "High" | "Critical";
export type View = "kanban" | "list" | "timeline";

export interface Task {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  startDate: string;
  dueDate: string;
}

interface State {
  tasks: Task[];
  users: Record<string, { id: string; name: string; color: string; taskId: number | null }>;
  view: View;
  filters: { status: Status[]; priority: Priority[]; assignee: string[] };
  setView: (view: View) => void;
  setFilters: (filters: Partial<State['filters']>) => void;
  setFiltersFromUrl: (params: URLSearchParams) => void;
  clearFilters: () => void;
  updateTask: (id: number, status: Status) => void;
  addTask: (task: Task) => void;
  syncUser: (userId: string, taskId: number | null) => void;
}

export const useStore = create<State>((set) => ({
  view: "kanban",
  filters: { status: [], priority: [], assignee: [] },
  users: {
    '1': { id: '1', name: 'Sarah', color: 'bg-pink-500', taskId: 101 },
    '2': { id: '2', name: 'Marcus', color: 'bg-emerald-500', taskId: 105 },
    '3': { id: '3', name: 'Lila', color: 'bg-amber-500', taskId: 110 },
    '4': { id: '4', name: 'Jordan', color: 'bg-indigo-500', taskId: 115 },
  },
  tasks: Array.from({ length: 500 }).map((_, i) => ({
    id: i + 1,
    title: `${i % 3 === 0 ? 'Refactor' : 'Implement'} Module ${i + 1}`,
    status: ["To Do", "In Progress", "In Review", "Done"][Math.floor(Math.random() * 4)] as Status,
    priority: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)] as Priority,
    assignee: ["Sarah", "Marcus", "Lila", "Jordan", "Alex", "Sam"][i % 6],
    startDate: "2026-03-01",
    dueDate: `2026-03-${((i % 28) + 1).toString().padStart(2, '0')}`,
  })),

  setView: (view) => set({ view }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  
  setFiltersFromUrl: (params) => {
    const status = params.get('status')?.split(',').filter(Boolean) as Status[] || [];
    const priority = params.get('priority')?.split(',').filter(Boolean) as Priority[] || [];
    const assignee = params.get('assignee')?.split(',').filter(Boolean) as string[] || [];
    set({ filters: { status, priority, assignee } });
  },

  clearFilters: () => set({ filters: { status: [], priority: [], assignee: [] } }),
  updateTask: (id, status) => set((s) => ({
    tasks: s.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),
  addTask: (newTask) => set((s) => ({ tasks: [newTask, ...s.tasks] })),
  syncUser: (userId, taskId) => set((s) => ({
    users: { ...s.users, [userId]: { ...s.users[userId], taskId } }
  })),
}));