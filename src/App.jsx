import { lazy, Suspense } from 'react';
import { GameProvider, useGame, GAME_PHASE } from './context/GameContext';
import MainMenu from './components/MainMenu';
import CombatScreen from './components/CombatScreen';
import RewardScreen from './components/RewardScreen';
import GameOverScreen from './components/GameOverScreen';
import VictoryScreen from './components/VictoryScreen';
import PersistentHeader from './components/PersistentHeader';
import PlayerStatusBar from './components/PlayerStatusBar';
import './App.css';

// Lazy load heavy screens for better initial load performance
const MapScreen = lazy(() => import('./components/MapScreen'));
const ShopScreen = lazy(() => import('./components/ShopScreen'));
const EventScreen = lazy(() => import('./components/EventScreen'));
const RestSite = lazy(() => import('./components/RestSite'));
const DataEditor = lazy(() => import('./components/DataEditor'));

const GameContent = () => {
  const { state } = useGame();

  const renderPhase = () => {
    switch (state.phase) {
      case GAME_PHASE.MAIN_MENU:
        return <MainMenu />;
      case GAME_PHASE.MAP:
        return <MapScreen />;
      case GAME_PHASE.COMBAT:
        return <CombatScreen />;
      case GAME_PHASE.COMBAT_REWARD:
      case GAME_PHASE.CARD_REWARD:
        return <RewardScreen />;
      case GAME_PHASE.REST_SITE:
        return <RestSite />;
      case GAME_PHASE.SHOP:
        return <ShopScreen />;
      case GAME_PHASE.EVENT:
        return <EventScreen />;
      case GAME_PHASE.GAME_OVER:
        return <GameOverScreen />;
      case GAME_PHASE.VICTORY:
        return <VictoryScreen />;
      case GAME_PHASE.DATA_EDITOR:
        return <DataEditor />;
      default:
        return <MainMenu />;
    }
  };

  const hideChrome = state.phase === GAME_PHASE.DATA_EDITOR || state.phase === GAME_PHASE.MAIN_MENU;

  return (
    <div className="game-container">
      {!hideChrome && <PersistentHeader />}
      <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading...</div>}>
        {renderPhase()}
      </Suspense>
      {!hideChrome && <PlayerStatusBar />}
    </div>
  );
};

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
