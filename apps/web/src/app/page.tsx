import { TodayView } from '@/components/dashboard/today-view';
import { WeeklyCalendar } from '@/components/dashboard/weekly-calendar';
import { GoalPanel } from '@/components/dashboard/goal-panel';
import { MetricsPanel } from '@/components/dashboard/metrics-panel';
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  Bell,
  User,
  Settings,
  Search,
  Plus,
  Zap,
  Clock,
  Briefcase,
  Coffee,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import React from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [activeMode, setActiveMode] = React.useState('work');

  const mockData = {
    meetings: [
      { id: '1', title: 'Q3 Strategy Sync', start_time: new Date().toISOString(), location: 'Zoom', duration: '45 min' },
    ],
    tasks: [
      { id: '1', title: 'Draft Project Proposal', status: 'pending', estimated_duration: 60, priority: 4, deadline: new Date().toISOString() },
      { id: '2', title: 'Review Team PRs', status: 'pending', estimated_duration: 30, priority: 3, deadline: new Date().toISOString() },
      { id: '3', title: 'Update Documentation', status: 'pending', estimated_duration: 120, priority: 2, deadline: new Date(Date.now() + 86400000).toISOString() },
    ],
    goals: [
      { id: '1', title: 'Launch AI Assistant', progress: 65, status: 'on-track' },
      { id: '2', title: 'Q2 Revenue Target', progress: 40, status: 'at-risk' },
    ],
    routines: [],
  };

  const allItems = [...mockData.meetings, ...mockData.tasks];

  const modes = [
    { id: 'work', label: 'Work', icon: <Briefcase size={14} />, color: 'text-blue-500' },
    { id: 'personal', label: 'Personal', icon: <Coffee size={14} />, color: 'text-orange-500' },
    { id: 'focus', label: 'Focus', icon: <Target size={14} />, color: 'text-purple-500' },
  ];

  if (activeMode === 'focus') {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-8"
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto border-4 border-primary/30 animate-pulse">
            <Target size={40} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter">Focusing</h1>
            <p className="text-slate-400 font-medium">Currently working on: <span className="text-white">Draft Project Proposal</span></p>
          </div>
          <div className="text-7xl font-mono font-bold tracking-widest text-primary">
            24:59
          </div>
          <button
            onClick={() => setActiveMode('work')}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm transition-all"
          >
            End Focus Session
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FB] text-[#1A1C1E] font-sans selection:bg-primary/10 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col shrink-0">
        <div className="p-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900">Nexus AI</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<Calendar size={18} />} label="Calendar" active={activeTab === 'Calendar'} onClick={() => setActiveTab('Calendar')} />
          <NavItem icon={<CheckCircle2 size={18} />} label="Tasks" active={activeTab === 'Tasks'} onClick={() => setActiveTab('Tasks')} />
          <NavItem icon={<Bell size={18} />} label="Notifications" active={activeTab === 'Notifications'} onClick={() => setActiveTab('Notifications')} />
        </nav>

        <div className="p-4 border-t space-y-1.5">
          <NavItem icon={<User size={18} />} label="Profile" />
          <NavItem icon={<Settings size={18} />} label="Settings" />

          <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">Storage</p>
             <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3" />
             </div>
             <p className="text-[10px] text-slate-500 mt-2 font-medium">1.2GB of 2GB used</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b px-8 flex justify-between items-center shrink-0 z-10">
           <div className="flex items-center gap-8">
              <div className="relative w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full bg-[#F1F3F5] border-transparent border focus:border-primary/20 focus:bg-white rounded-2xl py-2 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>

              {/* Mode Switcher (Step 16) */}
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                 {modes.map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setActiveMode(mode.id)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                        activeMode === mode.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <span className={activeMode === mode.id ? mode.color : ""}>{mode.icon}</span>
                      {mode.label}
                    </button>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
              </button>

              <div className="flex items-center gap-3 pl-6 border-l">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Jules</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Pro Member</p>
                </div>
                <button className="w-11 h-11 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden hover:scale-105 transition-transform active:scale-95">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jules&backgroundColor=b6e3f4" alt="avatar" />
                </button>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1200px] mx-auto p-10">
            <header className="flex justify-between items-end mb-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                  {activeMode === 'work' ? 'Productivity Dashboard' : 'Personal Space'}
                </h2>
                <p className="text-slate-500 font-medium text-lg">
                  Welcome back! You have <span className="text-primary font-bold">3 tasks</span> to focus on today.
                </p>
              </motion.div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all"
                >
                  <Calendar size={18} className="text-slate-400" /> View Calendar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/25 flex items-center gap-2 hover:bg-primary/90 transition-all"
                >
                  <Plus size={18} strokeWidth={3} /> Create New Task
                </motion.button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                <TodayView {...mockData} />
                <WeeklyCalendar items={allItems} />
              </div>

              <div className="lg:col-span-4 space-y-10">
                <GoalPanel goals={mockData.goals} />
                <MetricsPanel />

                <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary rounded-full -mr-20 -mt-20 blur-[80px] opacity-50 group-hover:opacity-70 transition-opacity" />
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 text-primary">
                      <Clock className="w-4 h-4" /> Focus Mode
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-slate-300 mb-8 leading-relaxed font-medium">
                      Ready for some deep work? Start a 25-minute pomodoro session.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setActiveMode('focus')}
                        className="flex-1 bg-primary text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                      >
                        Start Session
                      </button>
                      <button className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
                         <Settings size={18} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all relative group",
        active
          ? "bg-primary text-white shadow-lg shadow-primary/20"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110", active ? "text-white" : "text-slate-400 group-hover:text-primary")}>
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </button>
  );
}
