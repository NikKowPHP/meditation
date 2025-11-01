import React from 'react';
import { IonCard, IonCardContent, IonText } from '@ionic/react';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
}) => {
  return (
    <IonCard>
      <IonCardContent>
        <IonText color="primary">
          <h2>Welcome back!</h2>
        </IonText>
        <div
          style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <IonText color="secondary">
              <h3>{currentStreak}</h3>
              <p>Current Streak</p>
            </IonText>
          </div>
          <div style={{ textAlign: 'center' }}>
            <IonText color="tertiary">
              <h3>{longestStreak}</h3>
              <p>Longest Streak</p>
            </IonText>
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default StreakDisplay;
