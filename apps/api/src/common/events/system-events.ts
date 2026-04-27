export enum SystemEvents {
  TASK_CREATED = 'task.created',
  TASK_COMPLETED = 'task.completed',
  TASK_STATUS_CHANGED = 'task.status_changed',
  TASK_MISSED_DEADLINE = 'task.missed_deadline',

  MEETING_ADDED = 'meeting.added',
  MEETING_CANCELLED = 'meeting.cancelled',

  GOAL_CREATED = 'goal.created',
  GOAL_PROGRESS_UPDATED = 'goal.progress_updated',
  GOAL_STAGNATED = 'goal.stagnated',

  OVERLOAD_DETECTED = 'overload.detected',

  BEHAVIORAL_PATTERN_UPDATED = 'behavioral.pattern_updated',
}
