import { Module, Global } from '@nestjs/common';
import { AIService } from './services/ai.service';
import { ContextStateService } from './services/context-state.service';
import { RedisService } from './services/redis.service';
import { SystemEventLogger } from './events/system-event-logger';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [AIService, ContextStateService, RedisService, SystemEventLogger],
  exports: [AIService, ContextStateService, RedisService, SystemEventLogger],
})
export class CommonModule {}
