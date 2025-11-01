import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

class AuthService {
  private authState = new BehaviorSubject<boolean>(false);
  public authState$ = this.authState.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Check for stored session
    const { value } = await Preferences.get({ key: 'supabase_session' });
    if (value) {
      const session = JSON.parse(value);
      supabase.auth.setSession(session);
      this.authState.next(true);
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await Preferences.set({
          key: 'supabase_session',
          value: JSON.stringify(session),
        });
        this.authState.next(true);
      } else {
        await Preferences.remove({ key: 'supabase_session' });
        this.authState.next(false);
      }
    });
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  getCurrentUser() {
    return supabase.auth.getUser();
  }

  getSession() {
    return supabase.auth.getSession();
  }
}

export const authService = new AuthService();
export default authService;
