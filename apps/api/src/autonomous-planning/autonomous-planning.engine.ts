import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { AIService } from '../common/services/ai.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemEvents } from '../common/events/system-events';

@Injectable()
export class AutonomousPlanningEngine {
  constructor(
    private supabase: SupabaseService,
    private ai: AIService,
    private scheduling: SchedulingService
  ) {}

  @OnEvent(SystemEvents.GOAL_CREATED)
  async handleNewGoal(payload: { userId: string, goalId: string, goal: any }) {
    await this.generateGoalExecutionPlan(payload.userId, payload.goalId, payload.goal);
  }

  async generateGoalExecutionPlan(userId: string, goalId: string, goal: any) {
    const prompt = `
      As an AI Strategic Planner, break down the following goal into 3-7 milestones and 2-5 specific tasks per milestone:
      Goal: ${goal.title}
      Description: ${goal.description}
      Category: ${goal.category}
      Target Date: ${goal.target_date}

      Consider historical velocity and best practices.
      Return JSON with fields:
      "milestones": [{title, target_date}],
      "tasks": [{title, estimated_duration, priority}],
      "rationale": "Explanation of the planning strategy"
    `;

    try {
      const planData = await this.ai.generateStructuredResponse(prompt);

      await this.supabase.getAdminClient()
        .from('autonomous_plans')
        .insert({
          user_id: userId,
          plan_type: 'goal_execution',
          entity_id: goalId,
          content_json: { milestones: planData.milestones, tasks: planData.tasks },
          planning_rationale: planData.rationale,
          status: 'draft'
        });
    } catch (e) {
      console.error('Goal Planning Error:', e);
    }
  }

  async generateWeeklyPlan(userId: string) {
    // sunday evening review logic (Step 45)
    const adminClient = this.supabase.getAdminClient();
    const { data: tasks } = await adminClient.from('tasks').select('*').eq('user_id', userId).eq('status', 'pending');
    const { data: goals } = await adminClient.from('goals').select('*').eq('user_id', userId).eq('status', 'active');

    const prompt = `
      Generate a weekly execution plan for the upcoming 7 days.
      Active Goals: ${JSON.stringify(goals)}
      Pending Tasks: ${JSON.stringify(tasks)}

      Balance workload across days while respecting priority and goal alignment.
      Return JSON with "daily_distribution": { "YYYY-MM-DD": [task_ids] } and "rationale".
    `;

    try {
      const planData = await this.ai.generateStructuredResponse(prompt);
      await adminClient.from('autonomous_plans').insert({
        user_id: userId,
        plan_type: 'weekly_plan',
        content_json: planData.daily_distribution,
        planning_rationale: planData.rationale,
        status: 'draft'
      });
    } catch (e) {
      console.error('Weekly Planning Error:', e);
    }
  }
}
