import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseDataService } from '../services/SupabaseDataService';

const mockMaybeSingle = vi.fn();
const mockProfileSelectEq = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockProfileSelect = vi.fn(() => ({ eq: mockProfileSelectEq }));

const mockProfileUpdateEq = vi.fn();
const mockProfileUpdate = vi.fn(() => ({ eq: mockProfileUpdateEq }));

const mockProfileInsert = vi.fn();
const mockPredefinedSelect = vi.fn();

const mockFrom = vi.fn((table: string) => {
  if (table === 'profiles') {
    return {
      select: mockProfileSelect,
      update: mockProfileUpdate,
      insert: mockProfileInsert,
    };
  }

  if (table === 'predefined_videos') {
    return {
      select: mockPredefinedSelect,
    };
  }

  return {};
});

const mockRpc = vi.fn();

const mockAuthGetUser = vi.fn();
const mockAuthSetSession = vi.fn();
const mockAuthOnAuthStateChange = vi.fn();
const mockAuthSignUp = vi.fn();
const mockAuthSignInWithPassword = vi.fn();
const mockAuthSignOut = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    rpc: mockRpc,
    auth: {
      getUser: mockAuthGetUser,
      setSession: mockAuthSetSession,
      onAuthStateChange: mockAuthOnAuthStateChange,
      signUp: mockAuthSignUp,
      signInWithPassword: mockAuthSignInWithPassword,
      signOut: mockAuthSignOut,
    },
  })),
}));

describe('SupabaseDataService', () => {
  let service: SupabaseDataService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SupabaseDataService();
  });

  it('should get profile', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: { id: 'user-id', current_streak: 5, longest_streak: 10 },
      error: null,
      status: 200,
      statusText: 'OK',
      count: null,
    });

    const result = await service.getProfile('user-id');
    expect(result).toEqual({ id: 'user-id', current_streak: 5, longest_streak: 10 });
    expect(mockProfileSelect).toHaveBeenCalledWith('*');
    expect(mockProfileSelectEq).toHaveBeenCalledWith('id', 'user-id');
    expect(mockMaybeSingle).toHaveBeenCalled();
  });

  it('should update profile', async () => {
    mockProfileUpdateEq.mockResolvedValue({
      data: null,
      error: null,
      status: 204,
      statusText: 'No Content',
      count: null,
    });

    await expect(service.updateProfile('user-id', { current_streak: 6 })).resolves.not.toThrow();
    expect(mockProfileUpdate).toHaveBeenCalledWith({ current_streak: 6 });
    expect(mockProfileUpdateEq).toHaveBeenCalledWith('id', 'user-id');
  });

  it('should call meditation completion RPC', async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: null,
      status: 200,
      statusText: 'OK',
      count: null,
    });

    const ensureProfileSpy = vi.spyOn(service, 'ensureProfileExists').mockResolvedValue();

    await expect(service.callMeditationCompletion('video-id', 'Title')).resolves.not.toThrow();
    expect(ensureProfileSpy).toHaveBeenCalled();
    expect(mockRpc).toHaveBeenCalledWith('handle_meditation_completion', {
      video_id_param: 'video-id',
      video_title_param: 'Title',
    });
  });
});
