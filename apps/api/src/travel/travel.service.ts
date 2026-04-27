import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { AIService } from '../common/services/ai.service';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class TravelService {
  constructor(
    private supabase: SupabaseService,
    private ai: AIService,
    private tasks: TasksService
  ) {}

  async createTravelPlan(userId: string, data: any) {
    const { data: plan, error } = await this.supabase.getClient()
      .from('travel_plans')
      .insert({ user_id: userId, ...data })
      .select()
      .single();

    if (error) throw error;

    // Step 41: Auto-generate pre-travel tasks
    await this.generatePreTravelTasks(userId, plan);

    return plan;
  }

  async confirmPlan(userId: string, planId: string) {
    const { data: plan, error } = await this.supabase.getClient()
      .from('travel_plans')
      .update({ status: 'confirmed' })
      .eq('id', planId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    // Step 41: Auto-scheduling actions
    await this.createTravelDayOff(userId, plan);
    await this.generatePackingChecklist(userId, planId);

    return plan;
  }

  private async generatePreTravelTasks(userId: string, plan: any) {
    const departure = new Date(plan.departure_date);

    const tasks = [
      { title: `Check passport validity for ${plan.destination}`, offset: -30 },
      { title: `Confirm hotel & transport for ${plan.destination}`, offset: -14 },
      { title: `Online check-in for ${plan.destination} trip`, offset: -3 },
    ];

    for (const t of tasks) {
      const deadline = new Date(departure);
      deadline.setDate(deadline.getDate() + t.offset);

      await this.tasks.createTask(userId, {
        title: t.title,
        deadline: deadline.toISOString(),
        status: 'pending',
        priority: 2
      });
    }
  }

  private async createTravelDayOff(userId: string, plan: any) {
    await this.supabase.getClient()
      .from('day_off_periods')
      .insert({
        user_id: userId,
        start_date: plan.departure_date,
        end_date: plan.return_date,
        type: 'vacation',
        label: `Trip to ${plan.destination}`,
        auto_reschedule: true
      });
  }

  private async generatePackingChecklist(userId: string, planId: string) {
    const { data: plan } = await this.supabase.getClient()
      .from('travel_plans')
      .select('*')
      .eq('id', planId)
      .single();

    const prompt = `
      Generate a comprehensive packing checklist for a ${plan.purpose} trip to ${plan.destination}
      from ${plan.departure_date} to ${plan.return_date}.
      Include destination-specific items.
      Return JSON array of strings.
    `;

    try {
      const items = await this.ai.generateStructuredResponse(prompt);
      const travelItems = items.map((item: string) => ({
        travel_plan_id: planId,
        item_type: 'packing_item',
        title: item,
        status: 'pending'
      }));

      await this.supabase.getClient()
        .from('travel_items')
        .insert(travelItems);
    } catch (e) {
      console.error('Packing List Generation Error:', e);
    }
  }
}
