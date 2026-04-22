import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';

@Injectable()
export class ProfilesService {
  constructor(private supabase: SupabaseService) {}

  async getProfile(userId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create default
      return this.createProfile(userId, { assistant_name: 'Assistant', personality_type: 'Professional' });
    }
    return data;
  }

  async createProfile(userId: string, profileData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('user_profiles')
      .insert({ id: userId, ...profileData })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updateData: any) {
    const { data, error } = await this.supabase.getClient()
      .from('user_profiles')
      .update({ ...updateData, updated_at: new Date() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await this.supabase.getClient()
      .storage
      .from('assets')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = this.supabase.getClient()
      .storage
      .from('assets')
      .getPublicUrl(filePath);

    await this.updateProfile(userId, { avatar_url: publicUrl });
    return { avatar_url: publicUrl };
  }
}
