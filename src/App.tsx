import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, search, person } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import HomeScreen from './pages/HomeScreen';
import SearchScreen from './pages/SearchScreen';
import ProfileScreen from './pages/ProfileScreen';
import AuthScreen from './pages/AuthScreen';
import PlayerScreen from './pages/PlayerScreen';
import authService from './services/AuthService';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AuthenticatedTabs = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tabs/home">
        <HomeScreen />
      </Route>
      <Route exact path="/tabs/search">
        <SearchScreen />
      </Route>
      <Route exact path="/tabs/profile">
        <ProfileScreen />
      </Route>
      <Route exact path="/tabs">
        <Redirect to="/tabs/home" />
      </Route>
    </IonRouterOutlet>
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/tabs/home">
        <IonIcon icon={home} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton tab="search" href="/tabs/search">
        <IonIcon icon={search} />
        <IonLabel>Search</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/tabs/profile">
        <IonIcon icon={person} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const subscription = authService.authState$.subscribe(setIsAuthenticated);
    return () => subscription.unsubscribe();
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route
            path="/tabs"
            render={() =>
              isAuthenticated ? <AuthenticatedTabs /> : <Redirect to="/auth" />
            }
          />
          <Route
            path="/player"
            render={() =>
              isAuthenticated ? <PlayerScreen /> : <Redirect to="/auth" />
            }
          />
          <Route
            exact
            path="/auth"
            render={() =>
              isAuthenticated ? <Redirect to="/tabs/home" /> : <AuthScreen />
            }
          />
          <Route
            exact
            path="/"
            render={() => <Redirect to={isAuthenticated ? '/tabs/home' : '/auth'} />}
          />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
