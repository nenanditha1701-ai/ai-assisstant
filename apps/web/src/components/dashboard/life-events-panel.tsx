"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart, Briefcase, Home, GraduationCap, Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LifeEventsPanel = ({ events }: any) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'relocation': return <Home className="w-4 h-4 text-blue-500" />;
      case 'career_change': return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case 'wedding': return <Heart className="w-4 h-4 text-pink-500" />;
      default: return <GraduationCap className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Major Life Transitions
          </div>
          <button className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
             <Plus size={14} />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {events?.length > 0 ? events.map((event: any) => (
          <div key={event.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                   {getIcon(event.event_type)}
                </div>
                <div>
                   <h4 className="text-xs font-black text-slate-900">{event.title}</h4>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{event.target_date}</p>
                </div>
              </div>
              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-black uppercase tracking-widest">Active</span>
            </div>
            <div className="flex justify-between items-center">
               <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-slate-500">
                     <span>Preparation</span>
                     <span>65%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                     <div className="h-full bg-primary" style={{ width: '65%' }} />
                  </div>
               </div>
               <ArrowRight size={14} className="ml-4 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          </div>
        )) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No active life events</p>
             <p className="text-[10px] text-slate-300 mt-1">Plan major transitions with AI</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import { Sparkles } from 'lucide-react';
