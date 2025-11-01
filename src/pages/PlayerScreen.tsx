import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonLoading,
  IonAlert,
  IonToast,
  useIonRouter,
} from '@ionic/react';
import YouTube from 'react-youtube';
import { useLocation } from 'react-router-dom';
import supabaseDataService from '../services/SupabaseDataService';
import notificationService from '../services/NotificationService';

interface VideoParams {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
}

const PlayerScreen: React.FC = () => {
  const location = useLocation();
  const router = useIonRouter();
  const [videoParams, setVideoParams] = useState<VideoParams | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const videoId = params.get('videoId');
    const title = params.get('title');
    const description = params.get('description');
    const thumbnail = params.get('thumbnail');

    if (videoId && title && description && thumbnail) {
      setVideoParams({
        videoId,
        title: decodeURIComponent(title),
        description: decodeURIComponent(description),
        thumbnail: decodeURIComponent(thumbnail),
      });
    }
  }, [location]);

  const handleVideoEnd = async () => {
    if (!videoParams) return;

    setLoading(true);
    try {
      await supabaseDataService.callMeditationCompletion(
        videoParams.videoId,
        videoParams.title,
      );
      await notificationService.scheduleReminder();
      setShowAlert(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Completion failed';
      setError(errorMessage);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertDismiss = () => {
    setShowAlert(false);
    router.goBack();
  };

  if (!videoParams) {
    return <IonLoading isOpen message="Loading video..." />;
  }

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{videoParams.title}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{videoParams.title}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: '16px' }}>
          <YouTube videoId={videoParams.videoId} opts={opts} onEnd={handleVideoEnd} />
        </div>

        <IonLoading isOpen={loading} message="Completing meditation..." />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={handleAlertDismiss}
          header="Meditation Complete!"
          message="Great job! Your streak has been updated."
          buttons={['OK']}
        />

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

export default PlayerScreen;
