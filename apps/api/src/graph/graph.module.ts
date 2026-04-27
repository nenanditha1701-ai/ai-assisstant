import { Module } from '@nestjs/common';
import { GraphService } from './graph.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [GraphService],
  exports: [GraphService],
})
export class GraphModule {}
