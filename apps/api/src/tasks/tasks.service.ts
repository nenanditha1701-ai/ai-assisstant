import { Injectable, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupabaseService } from '../auth/supabase.service';
import { AuditService } from '../auth/audit.service';
import { BehavioralAnalysisService } from '../analytics/behavioral-analysis.service';
import { SystemEvents } from '../common/events/system-events';
import * as chrono from 'chrono-node';

@Injectable()
export class TasksService {
  constructor(
    private supabase: SupabaseService,
    private audit: AuditService,
    private behavioral: BehavioralAnalysisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getTasks(userId: string, filters: any = {}) {
    let query = this.supabase.getClient()
      .from('tasks')
      .select('*')
      .is('deleted_at', null);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.priority) query = query.eq('priority', filters.priority);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createTask(userId: string, taskData: any) {
    const parsedData = this.parseTaskText(taskData.title);
    const finalData = { ...taskData, ...parsedData, user_id: userId };

    const { data, error } = await this.supabase.getClient()
      .from('tasks')
      .insert(finalData)
      .select()
      .single();

    if (error) throw error;

    await this.audit.logEvent(userId, 'tasks', data.id, 'create', null, finalData);
    await this.behavioral.logEvent(userId, 'task_created', 'task', data.id, { title: data.title });

    this.eventEmitter.emit(SystemEvents.TASK_CREATED, { userId, task: data });

    return data;
  }

  async updateTask(userId: string, taskId: string, updateData: any) {
    const { data: oldData } = await this.supabase.getClient()
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    const { data, error } = await this.supabase.getClient()
      .from('tasks')
      .update({ ...updateData, updated_at: new Date() })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    await this.audit.logEvent(userId, 'tasks', taskId, 'update', oldData, data);

    if (updateData.status === 'completed') {
      await this.behavioral.logEvent(userId, 'task_completed', 'task', taskId, {
        delay: this.calculateDelay(data.deadline, new Date()),
      });
      this.eventEmitter.emit(SystemEvents.TASK_COMPLETED, { userId, taskId, task: data });
    } else {
      this.eventEmitter.emit(SystemEvents.TASK_STATUS_CHANGED, { userId, taskId, status: updateData.status });
    }

    return data;
  }

  private calculateDelay(deadline: string, completedAt: Date) {
    if (!deadline) return 0;
    const diff = completedAt.getTime() - new Date(deadline).getTime();
    return Math.max(0, diff / (1000 * 60));
  }

  async softDeleteTask(userId: string, taskId: string) {
    return this.updateTask(userId, taskId, { deleted_at: new Date() });
  }

  async addDependency(taskId: string, dependsOnId: string, type: string) {
    const hasCycle = await this.checkCircularDependency(taskId, dependsOnId);
    if (hasCycle) {
      throw new BadRequestException('Circular dependency detected');
    }

    const { data, error } = await this.supabase.getClient()
      .from('task_dependencies')
      .insert({ task_id: taskId, depends_on_task_id: dependsOnId, dependency_type: type })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  private parseTaskText(text: string) {
    const parsed: any = {};
    const results = chrono.parse(text);
    if (results.length > 0) {
      parsed.deadline = results[0].start.date();
    }
    const durationRegex = /(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/i;
    const match = text.match(durationRegex);
    if (match && (match[1] || match[2])) {
      const hours = parseInt(match[1] || '0');
      const mins = parseInt(match[2] || '0');
      if (hours > 0 || mins > 0) {
        parsed.estimated_duration = hours * 60 + mins;
      }
    }
    return parsed;
  }

  private async checkCircularDependency(taskId: string, dependsOnId: string): Promise<boolean> {
    const visited = new Set<string>();
    const stack = [dependsOnId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === taskId) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const { data } = await this.supabase.getClient()
        .from('task_dependencies')
        .select('depends_on_task_id')
        .eq('task_id', current);

      if (data) {
        stack.push(...data.map(d => d.depends_on_task_id));
      }
    }
    return false;
  }
}
