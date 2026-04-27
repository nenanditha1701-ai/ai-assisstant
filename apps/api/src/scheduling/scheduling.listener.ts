import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SystemEvents } from '../common/events/system-events';
import { WorkloadForecastingService } from './workload-forecasting.service';

@Injectable()
export class SchedulingListener {
  constructor(private forecasting: WorkloadForecastingService) {}

  @OnEvent(SystemEvents.TASK_CREATED)
  @OnEvent(SystemEvents.TASK_COMPLETED)
  @OnEvent(SystemEvents.TASK_STATUS_CHANGED)
  async handleTaskChanges(payload: { userId: string }) {
    await this.forecasting.generateForecast(payload.userId);
  }
}
