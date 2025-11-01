import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
} from '@ionic/react';
import { Video } from '../services/SupabaseDataService';

interface MeditationCardProps {
  video: Video;
  onTap: (video: Video) => void;
}

const MeditationCard: React.FC<MeditationCardProps> = ({ video, onTap }) => {
  return (
    <IonCard button onClick={() => onTap(video)}>
      <img
        alt={video.title}
        src={video.thumbnail_url}
        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
      />
      <IonCardHeader>
        <IonCardTitle>{video.title}</IonCardTitle>
        <IonCardSubtitle>{video.description}</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>{/* Additional content if needed */}</IonCardContent>
    </IonCard>
  );
};

export default MeditationCard;
