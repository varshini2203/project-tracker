# 🚀 Project Tracker – Velotrack

A modern **multi-view project management dashboard** built with React + TypeScript.  
It supports **Kanban, List (virtualized), and Timeline views**, along with drag & drop, filtering, and live collaboration simulation.

---

## 🌐 Live Demo
👉 https://project-tracker-s5sx.vercel.app/

---

## 📌 Features

### 🗂️ Multi View System
- Kanban Board (drag & drop tasks between columns)
<img width="1914" height="945" alt="image" src="https://github.com/user-attachments/assets/345b5305-4155-4e11-820c-5bee424e651a" />
- List View (optimized with virtualization)
<img width="1904" height="917" alt="image" src="https://github.com/user-attachments/assets/b509bd66-862d-4788-8b8b-aab7281eaeac" />
- Timeline View (Gantt-style project tracking)
<img width="1912" height="906" alt="image" src="https://github.com/user-attachments/assets/755fc7d3-51aa-4e43-b452-d6c4b74b2182" />

### ⚡ Task Management
- Create new tasks
- Update task status
- Assign priority (Low, Medium, High, Critical)
- Set due dates

### 🔍 Smart Filtering
- Filter by:
  - Status
  - Priority
  - Assignee
- Search tasks instantly

### 🧑‍🤝‍🧑 Live Collaboration Simulation
- Simulated active users
- Real-time task movement updates

### 🖱️ Drag & Drop System
- Smooth pointer-based drag interactions
- Visual drop target highlighting
- Drag preview card

### 📊 Performance Optimized
- Virtualized list rendering for large datasets
- Memoized filtering and grouping

---

## 🛠️ Tech Stack

- React (TypeScript)
- Zustand (State Management)
- Tailwind CSS
- Vite / CRA (based on setup)
- Custom Drag & Drop logic

---

## 📂 Project Structure


src/
│
├── components/
│ ├── TaskCard.tsx
│ ├── TaskRow.tsx
│ 
├── store/
│ ├── store.ts
│
├── App.tsx
└── main.tsx


---

## 🚀 Getting Started

### 1. Clone the repository

git clone https://github.com/your-username/project-tracker.git
2. Install dependencies
npm install
3. Run locally
npm run dev
4. Build for production
npm run build

🌍 Deployment (Vercel)
Push code to GitHub
Import project in Vercel
Set:
Framework Preset: Vite / Create React App
Build Command: npm run build
Output Directory: dist / build


⚠️ Known Issues
Random task simulation may crash if task list is empty
Timeline view depends on fixed date range (March 2026)
Minor ESLint warnings may affect CI builds if enforced

## 📈 Performance Requirement

- ⚡ Lighthouse Performance score is **85+ (Desktop)**
- 📸 Lighthouse report screenshot is included below for verification
<img width="1918" height="1019" alt="image" src="https://github.com/user-attachments/assets/92b579a0-359c-4c66-a71b-4d2098b2c418" />

> This ensures the application meets production-level performance standards including fast load time, optimized rendering, and efficient resource usage.


💡 Future Improvements
Backend integration (Firebase / Supabase)
Real-time WebSocket collaboration
Task comments & attachments
User authentication
Dark mode
Mobile responsiveness improvements


👨‍💻 Author

Built as a Frontend Engineering project to demonstrate:

Advanced UI architecture
State management
Performance optimization
Real-world dashboard design

📜 License

This project is for educational/demo purposes.
