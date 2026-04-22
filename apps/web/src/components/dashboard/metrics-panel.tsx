"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

export const MetricsPanel = ({ data }: any) => {
  const chartData = [
    { name: 'Mon', completed: 4 },
    { name: 'Tue', completed: 6 },
    { name: 'Wed', completed: 3 },
    { name: 'Thu', completed: 8 },
    { name: 'Fri', completed: 5 },
    { name: 'Sat', completed: 2 },
    { name: 'Sun', completed: 1 },
  ];

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Productivity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[140px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                fontSize={9}
                fontWeight={700}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8' }}
              />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontSize: '10px',
                  fontWeight: '700'
                }}
              />
              <Bar dataKey="completed">
                 {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.completed > 5 ? '#3B82F6' : '#94A3B8'}
                      opacity={0.8}
                      className="hover:opacity-100 transition-opacity cursor-pointer"
                    />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between">
           <div className="text-center flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Completion</p>
              <p className="text-sm font-black text-slate-900">84%</p>
           </div>
           <div className="w-px bg-slate-100 mx-2" />
           <div className="text-center flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Focus Score</p>
              <p className="text-sm font-black text-slate-900">7.2</p>
           </div>
        </div>
      </CardContent>
    </Card>
  );
};
