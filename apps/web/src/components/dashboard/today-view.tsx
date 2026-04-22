"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle2, MoreHorizontal, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export const TodayView = ({ tasks, meetings }: any) => {
  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b bg-white/50 py-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5 text-primary" /> Today's Timeline
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {meetings?.map((m: any, idx: number) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={m.id}
              className="group flex gap-6 items-start p-5 hover:bg-slate-50/50 transition-colors"
            >
              <div className="pt-0.5 min-w-[70px]">
                <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors uppercase tracking-wider">
                  {new Date(m.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{m.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {m.location}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span>45 mins</span>
                </div>
              </div>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="participant" />
                    </div>
                 ))}
              </div>
            </motion.div>
          ))}
          {tasks?.filter((t: any) => t.status === 'pending').map((t: any, idx: number) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (meetings?.length || 0 + idx) * 0.1 }}
              key={t.id}
              className="group flex gap-6 items-start p-5 hover:bg-slate-50/50 transition-colors"
            >
               <div className="pt-0.5 min-w-[70px]">
                  <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-primary transition-colors" />
                  </div>
               </div>
               <div className="flex-1 space-y-1">
                <h4 className="font-bold text-slate-700 group-hover:text-slate-900 transition-colors">{t.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600 uppercase">Task</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span>{t.estimated_duration} mins</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className={cn(
                    "font-bold",
                    t.priority >= 4 ? "text-orange-500" : "text-slate-400"
                  )}>Priority {t.priority}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

import { cn } from '@/components/ui/button';
