"use client"

import { TodayView } from '@/components/dashboard/today-view';
import { WeeklyCalendar } from '@/components/dashboard/weekly-calendar';
import { GoalPanel } from '@/components/dashboard/goal-panel';
import { MetricsPanel } from '@/components/dashboard/metrics-panel';
import { LifeEventsPanel } from '@/components/dashboard/life-events-panel';
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
  Target,
  ChevronDown,
  Globe,
  Sparkles,
  ArrowRight,
  Users,
  AlertCircle,
  CreditCard,
  Plane
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import React from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = React.useState('Dashboard');
  const [activeMode, setActiveMode] = React.useState('work');
  const [activeWorkspace, setActiveWorkspace] = React.useState('Personal');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = React.useState(false);

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
      {
        id: '1',
        title: 'Launch AI Assistant',
        progress: 65,
        health: 'on-track',
        category: 'Professional',
        days_remaining: 12,
        trajectory_explanation: 'Completing tasks 15% faster than projected.'
      },
    ],
    metrics: {
      on_time_rate: 88,
      overload_frequency: 1,
      weekly_completion: [
        { name: 'Mon', completed: 5 },
        { name: 'Tue', completed: 7 },
        { name: 'Wed', completed: 4 },
        { name: 'Thu', completed: 8 },
        { name: 'Fri', completed: 6 },
        { name: 'Sat', completed: 2 },
        { name: 'Sun', completed: 1 },
      ]
    },
    life_events: [
      { id: 'le1', title: 'London Relocation', event_type: 'relocation', target_date: '2026-08-15', status: 'active' }
    ],
    finances: {
      total_balance: '₹4,52,000',
      monthly_spend: '₹42,300',
      savings_rate: 32,
      insights: [
        { text: "Your subscription spend increased 12% this month. Review 'SaaS Tools'." }
      ]
    },
    forecasts: [
      { date: new Date().toISOString().split('T')[0], utilization_ratio: 0.85, risk_category: 'medium' },
      { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], utilization_ratio: 1.1, risk_category: 'critical' },
    ],
    recommendations: [
      {
        id: 'r1',
        type: 'reschedule',
        title: 'Optimize Thursday',
        description: 'Thursday is projected to be overloaded. Move "Update Documentation" to Wednesday?',
        impact: 'Reduces overload by 25%'
      }
    ]
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
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveMode('work')}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold text-sm transition-all"
            >
              End Focus Session
            </button>
          </div>
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

        {/* Workspace Switcher */}
        <div className="px-4 mb-6 relative">
           <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all group"
           >
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border shadow-sm font-bold text-xs text-primary">
                    {activeWorkspace === 'Personal' ? 'P' : 'T'}
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context</p>
                    <p className="text-xs font-black text-slate-900">{activeWorkspace}</p>
                 </div>
              </div>
              <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isWorkspaceMenuOpen ? "rotate-180" : "")} />
           </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<CheckCircle2 size={18} />} label="Tasks" active={activeTab === 'Tasks'} onClick={() => setActiveTab('Tasks')} />
          <NavItem icon={<Target size={18} />} label="Goals" active={activeTab === 'Goals'} onClick={() => setActiveTab('Goals')} />
          <NavItem icon={<CreditCard size={18} />} label="Finances" active={activeTab === 'Finances'} onClick={() => setActiveTab('Finances')} />
          <NavItem icon={<Plane size={18} />} label="Travel" active={activeTab === 'Travel'} onClick={() => setActiveTab('Travel')} />
          <NavItem icon={<Sparkles size={18} />} label="Life Events" active={activeTab === 'LifeEvents'} onClick={() => setActiveTab('LifeEvents')} />
        </nav>

        <div className="p-4 border-t space-y-1.5">
          <NavItem icon={<User size={18} />} label="Profile" />
          <NavItem icon={<Settings size={18} />} label="Settings" />

          <div className="mt-4 p-4 bg-slate-900 rounded-2xl shadow-xl">
             <div className="flex justify-between items-center mb-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nexus Core</p>
                <div className="flex gap-0.5">
                   {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />)}
                </div>
             </div>
             <p className="text-[11px] text-white font-bold leading-tight">Situational Intelligence Active.</p>
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
                  placeholder="Search your life..."
                  className="w-full bg-[#F1F3F5] border-transparent border focus:border-primary/20 focus:bg-white rounded-2xl py-2 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                />
              </div>

              <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
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
              <button className="relative p-2 text-slate-400 hover:text-primary transition-colors group">
                <Sparkles size={20} className="group-hover:animate-pulse" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              </button>

              <div className="flex items-center gap-3 pl-6 border-l">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Jules</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Pro Tier AI</p>
                </div>
                <button className="w-11 h-11 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden hover:scale-105 transition-transform active:scale-95">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jules&backgroundColor=b6e3f4" alt="avatar" />
                </button>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[1600px] mx-auto p-10">
            <header className="flex justify-between items-end mb-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 mb-2">
                   <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded tracking-widest">Situational Sync</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {activeMode === 'work' ? 'Capacity: 75% (Life Event Offset)' : 'Personal Buffer Active'}</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                  Integrated Life Dashboard
                </h2>
                <p className="text-slate-500 font-medium text-lg">
                  {mockData.finances.total_balance} total liquidity • London relocation prep at 65% • Next meeting in 45m.
                </p>
              </motion.div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-primary text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-primary/25 flex items-center gap-2 hover:bg-primary/90 transition-all"
                >
                  <Plus size={18} strokeWidth={3} /> Integrated Capture
                </motion.button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Finance Overview (Step 39) */}
                   <Card className="border-none shadow-sm bg-emerald-50/50 border border-emerald-100">
                      <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-emerald-600">
                            <CreditCard size={16} /> Financial Pulse
                         </CardTitle>
                      </CardHeader>
                      <CardContent>
                         <div className="flex justify-between items-end mb-4">
                            <div>
                               <p className="text-2xl font-black text-slate-900">{mockData.finances.total_balance}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Available Capital</p>
                            </div>
                            <div className="text-right">
                               <p className="text-sm font-black text-emerald-600">{mockData.finances.savings_rate}%</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase">Savings Rate</p>
                            </div>
                         </div>
                         <div className="p-3 bg-white rounded-xl border border-emerald-100">
                            <p className="text-[11px] font-medium text-slate-700 leading-tight flex items-center gap-2">
                               <Zap size={14} className="text-emerald-500" fill="currentColor" />
                               {mockData.finances.insights[0].text}
                            </p>
                         </div>
                      </CardContent>
                   </Card>

                   {/* Relocation Progress (Step 42) */}
                   <LifeEventsPanel events={mockData.life_events} />
                </div>

                <TodayView {...mockData} />
                <WeeklyCalendar items={allItems} forecasts={mockData.forecasts} />
              </div>

              <div className="lg:col-span-4 space-y-10">
                <GoalPanel goals={mockData.goals} />
                <MetricsPanel metrics={mockData.metrics} />

                {/* Cross-Domain Linkages (Step 43) */}
                <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                      <Globe size={16} /> Intelligence Graph
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/10">
                       <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary shrink-0">
                          <Link2 size={16} />
                       </div>
                       <div>
                          <p className="text-[11px] font-bold">Goal Linkage Detected</p>
                          <p className="text-[10px] text-slate-400 leading-tight mt-1">"London Relocation" is linked to "Savings Goal Q3". Success probability is 82%.</p>
                       </div>
                    </div>
                    <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                       View Dependency Map
                    </button>
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

import { Link2 } from 'lucide-react';

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
