'use client';

import { useEffect } from 'react';
import { supabase } from './client';
import { cacheData } from '../cache/indexeddb';

export function useSupabaseRealtime(table: string, userId: string) {
  useEffect(() => {
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `user_id=eq.${userId}` },
        (payload) => {
          console.log('Change received!', payload);
          // Update IndexedDB or local state
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            cacheData(table, [payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, userId]);
}
