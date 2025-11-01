import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonLoading,
  IonToast,
  useIonRouter,
} from '@ionic/react';
import authService from '../services/AuthService';

const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const router = useIonRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      setShowToast(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await authService.signUp(email, password);
        setError('Check your email for confirmation link');
      } else {
        await authService.signIn(email, password);
        router.push('/tabs/home', 'root');
      }
      setShowToast(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isSignUp ? 'Sign Up' : 'Sign In'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{isSignUp ? 'Sign Up' : 'Sign In'}</IonTitle>
          </IonToolbar>
        </IonHeader>

        <form onSubmit={handleSubmit}>
          <IonInput
            type="email"
            placeholder="Email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value!)}
            required
          />
          <IonInput
            type="password"
            placeholder="Password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value!)}
            required
          />
          <IonButton expand="block" type="submit" disabled={loading}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </IonButton>
        </form>

        <IonButton fill="clear" onClick={toggleMode}>
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </IonButton>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={error}
          duration={3000}
          color={error.includes('confirmation') ? 'success' : 'danger'}
        />

        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default AuthScreen;
