import { Module } from '@nestjs/common';
import { BehavioralModelingService } from './behavioral-modeling.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [BehavioralModelingService],
  exports: [BehavioralModelingService],
})
export class BehavioralModelingModule {}
