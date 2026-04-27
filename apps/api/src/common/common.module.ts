import { Module, Global } from '@nestjs/common';
import { AIService } from './services/ai.service';
import { ContextStateService } from './services/context-state.service';
import { RedisService } from './services/redis.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [AIService, ContextStateService, RedisService],
  exports: [AIService, ContextStateService, RedisService],
})
export class CommonModule {}
