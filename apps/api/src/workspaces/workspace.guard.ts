import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const workspaceId = request.headers['x-workspace-id'] || request.query.workspaceId;

    if (!userId) return false;
    if (!workspaceId) return true; // Default to personal if not specified (Step 32)

    const { data, error } = await this.supabase.getClient()
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    request.workspaceRole = data.role;
    return true;
  }
}
