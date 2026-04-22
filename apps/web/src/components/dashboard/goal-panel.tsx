"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from "@/components/ui/progress"
import { Target, TrendingUp } from 'lucide-react';

export const GoalPanel = ({ goals }: any) => {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Active Goals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {goals?.length > 0 ? goals.map((goal: any) => (
          <div key={goal.id} className="group cursor-pointer">
            <div className="flex justify-between items-end mb-2">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{goal.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium">Strategic Objective</p>
              </div>
              <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                {goal.progress || 0}%
              </span>
            </div>
            <Progress value={goal.progress || 0} className="h-1.5 bg-slate-100" />
          </div>
        )) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl">
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No active goals</p>
          </div>
        )}

        <button className="w-full py-2 border-2 border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
           <TrendingUp size={12} /> View Detailed Analytics
        </button>
      </CardContent>
    </Card>
  );
};
