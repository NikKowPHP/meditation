import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseDataService } from '../services/SupabaseDataService';
import { supabase } from './AuthService';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      rpc: vi.fn(),
    })),
  })),
}));

describe('SupabaseDataService', () => {
  let service: SupabaseDataService;

  beforeEach(() => {
    service = new SupabaseDataService();
  });

  it('should get profile', async () => {
    const mockSelect = vi.mocked(supabase.from('profiles').select().eq('id', 'user-id').single);
    mockSelect.mockResolvedValue({ data: { id: 'user-id', current_streak: 5 }, error: null });

    const result = await service.getProfile('user-id');
    expect(result).toEqual({ id: 'user-id', current_streak: 5 });
  });

  it('should update profile', async () => {
    const mockUpdate = vi.mocked(supabase.from('profiles').update({ current_streak: 6 }).eq('id', 'user-id'));
    mockUpdate.mockResolvedValue({ error: null });

    await expect(service.updateProfile('user-id', { current_streak: 6 })).resolves.not.toThrow();
    expect(mockUpdate).toHaveBeenCalledWith({ current_streak: 6 });
  });

  it('should call meditation completion RPC', async () => {
    const mockRpc = vi.mocked(supabase.rpc('handle_meditation_completion', {
      video_id_param: 'video-id',
      video_title_param: 'Title',
    }));
    mockRpc.mockResolvedValue({ error: null });

    await expect(service.callMeditationCompletion('video-id', 'Title')).resolves.not.toThrow();
    expect(mockRpc).toHaveBeenCalledWith({
      video_id_param: 'video-id',
      video_title_param: 'Title',
    });
  });
});
