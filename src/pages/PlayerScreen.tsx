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
  const [initialLoading, setInitialLoading] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
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

    setInitialLoading(false);
  }, [location]);

  useEffect(() => {
    if (videoParams) {
      setPlayerReady(false);
    }
  }, [videoParams]);

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

  const handlePlayerReady = () => {
    setPlayerReady(true);
  };

  const handleAlertDismiss = () => {
    setShowAlert(false);
    router.goBack();
  };

  const videoTitle = videoParams?.title ?? 'Meditation';

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
    },
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{videoTitle}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{videoTitle}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div style={{ padding: '16px' }}>
          {videoParams ? (
            <YouTube
              videoId={videoParams.videoId}
              opts={opts}
              onReady={handlePlayerReady}
              onEnd={handleVideoEnd}
            />
          ) : (
            !initialLoading && <p>We couldnt load that video.</p>
          )}
        </div>

        <IonLoading
          isOpen={initialLoading || (!!videoParams && !playerReady)}
          message="Loading video..."
        />
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
