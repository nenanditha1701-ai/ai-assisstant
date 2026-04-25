import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../auth/supabase.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MeetingRecordingService {
  constructor(
    private supabase: SupabaseService,
    private configService: ConfigService,
  ) {}

  async saveRecordingMetadata(userId: string, meetingId: string, storageUrl: string, fileSize: number, duration: number) {
    const adminClient = this.supabase.getAdminClient();
    const { data, error } = await adminClient
      .from('meeting_recordings')
      .insert({
        user_id: userId,
        meeting_id: meetingId,
        storage_url: storageUrl,
        file_size: fileSize,
        duration: duration,
        transcription_status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Enqueue transcription job (Logic for transcription service or background job)
    // For now, we'll just log it
    console.log(`Enqueued transcription job for recording ${data.id}`);

    return data;
  }

  async addTranscript(recordingId: string, content: string) {
      const adminClient = this.supabase.getAdminClient();
      const { data, error } = await adminClient
        .from('meeting_transcripts')
        .insert({
            recording_id: recordingId,
            content: content
        })
        .select()
        .single();

      if (error) throw error;

      // Update recording status
      await adminClient
        .from('meeting_recordings')
        .update({ transcription_status: 'completed' })
        .eq('id', recordingId);

      return data;
  }
}
