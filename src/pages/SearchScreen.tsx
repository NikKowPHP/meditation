import React, { useState, useCallback } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonLoading,
  IonToast,
  useIonRouter,
} from '@ionic/react';
import MeditationCard from '../components/MeditationCard';
import youtubeApiService, { YouTubeVideo } from '../services/YoutubeApiService';
import { Video } from '../services/SupabaseDataService';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useIonRouter();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const videos = await youtubeApiService.searchVideos(query);
      setResults(videos);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setShowToast(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (e: CustomEvent) => {
    const query = e.detail.value || '';
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleVideoTap = (video: YouTubeVideo) => {
    router.push(
      `/player?videoId=${video.videoId}&title=${encodeURIComponent(video.title)}&description=${encodeURIComponent(video.description)}&thumbnail=${encodeURIComponent(video.thumbnailUrl)}`,
    );
  };

  const mapToVideo = (ytVideo: YouTubeVideo): Video => ({
    id: 0, // Placeholder, not used for search results
    video_id: ytVideo.videoId,
    title: ytVideo.title,
    description: ytVideo.description,
    thumbnail_url: ytVideo.thumbnailUrl,
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Search</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Search</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonSearchbar
          value={searchQuery}
          onIonInput={handleSearchChange}
          placeholder="Search for meditation videos..."
          debounce={500}
        />

        {loading && <IonLoading isOpen={loading} message="Searching..." />}

        <IonList>
          {results.map((video) => (
            <MeditationCard
              key={video.videoId}
              video={mapToVideo(video)}
              onTap={() => handleVideoTap(video)}
            />
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

export default SearchScreen;
