import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonText,
  IonLoading,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  useIonRouter,
} from '@ionic/react';
import StreakDisplay from '../components/StreakDisplay';
import authService from '../services/AuthService';
import supabaseDataService, { Profile } from '../services/SupabaseDataService';

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useIonRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user.data.user) {
        setUserEmail(user.data.user.email || '');
        const profileData = await supabaseDataService.getProfile(user.data.user.id);
        setProfile(profileData);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.push('/auth', 'root');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      setShowToast(true);
    }
  };

  if (loading) {
    return <IonLoading isOpen={loading} message="Loading..." />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div style={{ padding: '16px' }}>
          <IonText>
            <h3>Email: {userEmail}</h3>
          </IonText>

          {profile && (
            <StreakDisplay
              currentStreak={profile.current_streak}
              longestStreak={profile.longest_streak}
            />
          )}

          <IonButton
            expand="block"
            color="danger"
            onClick={handleSignOut}
            style={{ marginTop: '32px' }}
          >
            Sign Out
          </IonButton>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={error}
          duration={3000}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default ProfileScreen;
