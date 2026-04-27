import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { TasksService } from '../tasks/tasks.service';

interface LifeEventTemplate {
  tasks: Array<{ title: string; offsetDays: number }>;
}

@Injectable()
export class LifeEventsService {
  private templates: Record<string, LifeEventTemplate> = {
    relocation: {
      tasks: [
        { title: 'Research new neighborhoods & housing', offsetDays: -90 },
        { title: 'Set relocation budget & finance plan', offsetDays: -85 },
        { title: 'Sign lease or complete purchase', offsetDays: -60 },
        { title: 'Book moving company & storage', offsetDays: -55 },
        { title: 'Begin packing non-essentials', offsetDays: -30 },
        { title: 'Update address with bank & govt', offsetDays: -15 },
        { title: 'Utility transfers (Electric, Water, Internet)', offsetDays: 7 },
      ]
    },
    career_change: {
      tasks: [
        { title: 'Update resume & portfolio', offsetDays: -60 },
        { title: 'Identify 10 target companies', offsetDays: -50 },
        { title: 'Reach out for 3 informational interviews', offsetDays: -40 },
        { title: 'Submit applications for top 3 roles', offsetDays: -30 },
        { title: 'Prepare for technical assessments', offsetDays: -20 },
      ]
    }
  };

  constructor(
    private supabase: SupabaseService,
    private tasksService: TasksService,
  ) {}

  async createLifeEvent(userId: string, eventData: any) {
    const { data: event, error } = await this.supabase.getClient()
      .from('life_events')
      .insert({
        user_id: userId,
        ...eventData
      })
      .select()
      .single();

    if (error) throw error;

    // Trigger template instantiation (Step 42)
    if (this.templates[event.event_type]) {
      await this.instantiateTemplate(userId, event.id, event.event_type, new Date(event.target_date));
    }

    return event;
  }

  async getActiveLifeEvents(userId: string) {
    const { data } = await this.supabase.getClient()
      .from('life_events')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');

    return data || [];
  }

  private async instantiateTemplate(userId: string, eventId: string, type: string, targetDate: Date) {
    const template = this.templates[type];
    for (const taskTemplate of template.tasks) {
      const deadline = new Date(targetDate);
      deadline.setDate(deadline.getDate() + taskTemplate.offsetDays);

      await this.tasksService.createTask(userId, {
        title: taskTemplate.title,
        deadline: deadline.toISOString(),
        life_event_id: eventId,
        status: 'pending',
        priority: 3
      });
    }
  }
}
