import { Module } from '@nestjs/common';
import { WorkspaceGuard } from './workspace.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [WorkspaceGuard],
  exports: [WorkspaceGuard],
})
export class WorkspacesModule {}
