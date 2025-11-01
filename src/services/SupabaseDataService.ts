import { supabase } from './AuthService';

export interface Profile {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_meditation_date?: string;
  username?: string;
  updated_at?: string;
}

export interface Video {
  id: number;
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
}

class SupabaseDataService {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    const { error } = await supabase.from('profiles').update(updates).eq('id', userId);

    if (error) throw error;
  }

  async getPredefinedVideos(): Promise<Video[]> {
    const { data, error } = await supabase.from('predefined_videos').select('*');

    if (error) throw error;
    return data || [];
  }

  async ensureProfileExists(): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('No authenticated user');

    const existingProfile = await this.getProfile(user.id);
    if (existingProfile) return;

    const { error: insertError } = await supabase.from('profiles').insert({
      id: user.id,
      username: user.email ?? null,
    });

    if (insertError && insertError.code !== '23505') {
      throw insertError;
    }
  }

  async callMeditationCompletion(videoId: string, videoTitle: string): Promise<void> {
    await this.ensureProfileExists();

    const { error } = await supabase.rpc('handle_meditation_completion', {
      video_id_param: videoId,
      video_title_param: videoTitle,
    });

    if (error) throw error;
  }
}

export const supabaseDataService = new SupabaseDataService();
export default supabaseDataService;
