import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { SupabaseService } from '../auth/supabase.service';
import { AuditService } from '../auth/audit.service';
import { BehavioralAnalysisService } from '../analytics/behavioral-analysis.service';

describe('TasksService Integration', () => {
  let service: TasksService;
  let supabaseService: SupabaseService;
  let behavioralService: BehavioralAnalysisService;

  const mockSupabaseClient = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve({ data: { id: 'test-id', title: 'Test Task' }, error: null })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: SupabaseService,
          useValue: { getClient: () => mockSupabaseClient },
        },
        {
          provide: AuditService,
          useValue: { logEvent: jest.fn() },
        },
        {
          provide: BehavioralAnalysisService,
          useValue: { logEvent: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    supabaseService = module.get<SupabaseService>(SupabaseService);
    behavioralService = module.get<BehavioralAnalysisService>(BehavioralAnalysisService);
  });

  it('should log a behavioral event when a task is created', async () => {
    await service.createTask('user-1', { title: 'New Task' });
    expect(behavioralService.logEvent).toHaveBeenCalledWith(
      'user-1',
      'task_created',
      'task',
      'test-id',
      expect.any(Object)
    );
  });

  it('should log a behavioral event with delay when a task is completed', async () => {
    mockSupabaseClient.single.mockResolvedValueOnce({
      data: { id: 'test-id', title: 'Task', deadline: new Date(Date.now() - 3600000).toISOString() },
      error: null
    });

    await service.updateTask('user-1', 'test-id', { status: 'completed' });

    expect(behavioralService.logEvent).toHaveBeenCalledWith(
      'user-1',
      'task_completed',
      'task',
      'test-id',
      expect.objectContaining({ delay: expect.any(Number) })
    );
  });
});
