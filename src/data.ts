/**
 * src/data.ts
 * Core data definitions and initial mock state generation.
 */

export type Status = "To Do" | "In Progress" | "In Review" | "Done";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface Task {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  assignee: string;
  dueDate: string;
  startDate: string; 
}

const STATUSES: Status[] = ["To Do", "In Progress", "In Review", "Done"];
const PRIORITIES: Priority[] = ["Low", "Medium", "High", "Critical"];
const NAMES = ["Sarah", "Marcus", "Lila", "Jordan", "Alex", "Sam"];

/**
 * Generates 500 mock tasks to demonstrate high-performance 
 * rendering (virtualization and memoized filtering).
 */
export const initialTasks: Task[] = Array.from({ length: 500 }, (_, i): Task => {
  // Base date set to late March 2026
  const due = new Date("2026-03-25");
  
  // Distribute dates across a 30-day window
  due.setDate(due.getDate() + (i % 30) - 10); 
  
  // Set start date 2-5 days before the due date
  const start = new Date(due);
  start.setDate(start.getDate() - (Math.floor(Math.random() * 3) + 2)); 

  return {
    id: i + 1,
    title: `${["Engine", "API", "UI", "Auth", "DB", "Core"][i % 6]} Module ${i + 1}`,
    status: STATUSES[i % 4],
    priority: PRIORITIES[i % 4],
    assignee: NAMES[i % 6],
    // split('T') ensures we get "YYYY-MM-DD" instead of a full ISO string/array
    dueDate: due.toISOString().split('T')[0],
    startDate: start.toISOString().split('T')[0],
  };
});