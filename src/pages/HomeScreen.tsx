import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonLoading,
  IonToast,
  useIonRouter,
} from '@ionic/react';
import StreakDisplay from '../components/StreakDisplay';
import MeditationCard from '../components/MeditationCard';
import authService from '../services/AuthService';
import supabaseDataService, { Profile, Video } from '../services/SupabaseDataService';
import notificationService from '../services/NotificationService';

const HomeScreen: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useIonRouter();

  useEffect(() => {
    loadData();
    requestNotificationPermission();
  }, []);

  const loadData = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user.data.user) {
        await supabaseDataService.ensureProfileExists();
        const profileData = await supabaseDataService.getProfile(user.data.user.id);
        setProfile(profileData);

        const videosData = await supabaseDataService.getPredefinedVideos();
        setVideos(videosData);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const granted = await notificationService.requestPermissions();
      if (!granted) {
        console.log('Notification permission denied');
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const handleVideoTap = (video: Video) => {
    router.push(
      `/tabs/player?videoId=${video.video_id}&title=${encodeURIComponent(video.title)}&description=${encodeURIComponent(video.description)}&thumbnail=${encodeURIComponent(video.thumbnail_url)}`,
    );
  };

  if (loading) {
    return <IonLoading isOpen={loading} message="Loading..." />;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>

        <StreakDisplay
          currentStreak={profile?.current_streak ?? 0}
          longestStreak={profile?.longest_streak ?? 0}
        />

        {!profile && (
          <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
            <p>Complete today&apos;s meditation to start your streak!</p>
          </div>
        )}

        <IonList>
          {videos.map((video) => (
            <MeditationCard key={video.id} video={video} onTap={handleVideoTap} />
          ))}
        </IonList>

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

export default HomeScreen;
