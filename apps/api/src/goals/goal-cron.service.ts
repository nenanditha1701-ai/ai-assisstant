import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GoalProgressService } from './goal-progress.service';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class GoalCronService {
  constructor(
    private goalProgress: GoalProgressService,
    private supabase: SupabaseService,
  ) {}

  @Cron(CronExpression.EVERY_WEEKEND)
  async handleWeeklySnapshots() {
    // In a real system, we'd iterate over all users
    const { data: users } = await this.supabase.getAdminClient()
      .from('profiles')
      .select('id');

    if (users) {
      for (const user of users) {
        await this.goalProgress.takeSnapshot(user.id);
      }
    }
  }
}
