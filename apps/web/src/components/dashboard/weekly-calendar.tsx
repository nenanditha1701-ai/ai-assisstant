"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const WeeklyCalendar = ({ items }: any) => {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <Card className="border-none shadow-sm bg-white overflow-hidden">
      <CardHeader className="border-b bg-white/50 py-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            Weekly Schedule
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold px-2 text-slate-600">
              {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d')}
            </span>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
              <ChevronRight size={16} />
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-7 border-collapse">
          {days.map((day, idx) => {
            const isToday = isSameDay(day, new Date());
            const dayItems = items?.filter((item: any) =>
              isSameDay(new Date(item.start_time || item.deadline), day)
            );

            return (
              <div
                key={day.toString()}
                className={cn(
                  "border-r last:border-r-0 min-h-[180px] p-4 flex flex-col gap-3",
                  isToday ? "bg-primary/[0.02]" : ""
                )}
              >
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    {format(day, 'EEE')}
                  </p>
                  <p className={cn(
                    "text-sm font-black w-7 h-7 flex items-center justify-center mx-auto rounded-full",
                    isToday ? "bg-primary text-white shadow-sm" : "text-slate-900"
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>

                <div className="space-y-1.5 flex-1">
                   {dayItems?.map((item: any) => (
                      <div
                        key={item.id}
                        className={cn(
                          "text-[9px] p-2 rounded-lg border shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
                          item.start_time
                            ? "bg-blue-50 border-blue-100 text-blue-700 font-bold"
                            : "bg-white border-slate-100 text-slate-600 font-medium"
                        )}
                      >
                        {item.title}
                      </div>
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

import { cn } from '@/components/ui/button';
