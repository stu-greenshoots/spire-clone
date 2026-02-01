import { lazy, Suspense, useEffect, useState, useCallback } from 'react';
import { GameProvider, useGame, GAME_PHASE } from './context/GameContext';
import MainMenu from './components/MainMenu';
import CombatScreen from './components/CombatScreen';
import RewardScreen from './components/RewardScreen';
import GameOverScreen from './components/GameOverScreen';
import VictoryScreen from './components/VictoryScreen';
import PersistentHeader from './components/PersistentHeader';
import PlayerStatusBar from './components/PlayerStatusBar';
import DevTools from './components/DevTools';
import PauseMenu from './components/PauseMenu';
import { audioManager, SOUNDS } from './systems/audioSystem';
import './App.css';

// Lazy load heavy screens for better initial load performance
const MapScreen = lazy(() => import('./components/MapScreen'));
const ShopScreen = lazy(() => import('./components/ShopScreen'));
const EventScreen = lazy(() => import('./components/EventScreen'));
const RestSite = lazy(() => import('./components/RestSite'));
const DataEditor = import.meta.env.DEV ? lazy(() => import('./components/DataEditor')) : null;
const StartingBonus = lazy(() => import('./components/StartingBonus'));
const CharacterSelect = lazy(() => import('./components/CharacterSelect'));

// Map game phases to music track IDs
const PHASE_MUSIC_MAP = {
  menu: SOUNDS.music.menu,
  map: SOUNDS.music.map,
  combat: SOUNDS.music.combat,
  boss: SOUNDS.music.boss,
  victory: SOUNDS.music.victory,
  defeat: SOUNDS.music.defeat,
  act3_map: SOUNDS.music.act3Map
};

function getMusicPhase(gamePhase, currentNode, act) {
  switch (gamePhase) {
    case GAME_PHASE.MAIN_MENU:
    case GAME_PHASE.CHARACTER_SELECT:
    case GAME_PHASE.STARTING_BONUS:
      return 'menu';
    case GAME_PHASE.MAP:
    case GAME_PHASE.REST_SITE:
    case GAME_PHASE.SHOP:
    case GAME_PHASE.EVENT:
      return act >= 3 ? 'act3_map' : 'map';
    case GAME_PHASE.COMBAT:
    case GAME_PHASE.COMBAT_REWARD:
    case GAME_PHASE.CARD_REWARD:
      return currentNode?.type === 'boss' ? 'boss' : 'combat';
    case GAME_PHASE.VICTORY:
      return 'victory';
    case GAME_PHASE.GAME_OVER:
      return 'defeat';
    default:
      return null;
  }
}

const GameContent = () => {
  const { state } = useGame();
  const [isPaused, setIsPaused] = useState(false);

  const handlePauseToggle = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handlePauseClose = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Escape key toggles pause menu (only during gameplay)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        const inGame = state.phase !== GAME_PHASE.MAIN_MENU &&
          state.phase !== GAME_PHASE.CHARACTER_SELECT &&
          state.phase !== GAME_PHASE.STARTING_BONUS &&
          state.phase !== GAME_PHASE.GAME_OVER &&
          state.phase !== GAME_PHASE.VICTORY;
        if (inGame) {
          setIsPaused(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase]);

  // Close pause menu when returning to main menu
  useEffect(() => {
    if (state.phase === GAME_PHASE.MAIN_MENU) {
      setIsPaused(false);
    }
  }, [state.phase]);

  // AR-06: Wire music to game phase transitions
  useEffect(() => {
    audioManager.setPhases(PHASE_MUSIC_MAP);
  }, []);

  useEffect(() => {
    const musicPhase = getMusicPhase(state.phase, state.currentNode, state.act);
    if (musicPhase) {
      audioManager.setPhase(musicPhase);
    }
  }, [state.phase, state.currentNode, state.act]);

  // AR-16: Play per-act ambient layer under music during gameplay
  useEffect(() => {
    const inGame = state.phase !== GAME_PHASE.MAIN_MENU &&
      state.phase !== GAME_PHASE.CHARACTER_SELECT &&
      state.phase !== GAME_PHASE.STARTING_BONUS &&
      state.phase !== GAME_PHASE.GAME_OVER &&
      state.phase !== GAME_PHASE.VICTORY;

    if (inGame && state.act >= 1 && state.act <= 4) {
      const ambientKey = `act${state.act}`;
      audioManager.playAmbient(SOUNDS.ambient[ambientKey]);
    } else {
      audioManager.stopAmbient();
    }
  }, [state.phase, state.act]);

  // Check if we're in victory/reward phase (show overlay on combat screen)
  const isVictoryPhase = state.phase === GAME_PHASE.COMBAT_REWARD || state.phase === GAME_PHASE.CARD_REWARD;

  const renderPhase = () => {
    switch (state.phase) {
      case GAME_PHASE.MAIN_MENU:
        return <MainMenu />;
      case GAME_PHASE.CHARACTER_SELECT:
        return <CharacterSelect />;
      case GAME_PHASE.STARTING_BONUS:
        return <StartingBonus />;
      case GAME_PHASE.MAP:
        return <MapScreen />;
      case GAME_PHASE.COMBAT:
        return <CombatScreen />;
      case GAME_PHASE.COMBAT_REWARD:
      case GAME_PHASE.CARD_REWARD:
        // Keep combat screen visible with defeated enemies, overlay reward screen
        return (
          <>
            <CombatScreen showDefeatedEnemies={true} />
            <RewardScreen isOverlay={true} />
          </>
        );
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
        return DataEditor ? <DataEditor /> : <MainMenu />;
      default:
        return <MainMenu />;
    }
  };

  const hideChrome = state.phase === GAME_PHASE.DATA_EDITOR || state.phase === GAME_PHASE.MAIN_MENU || state.phase === GAME_PHASE.CHARACTER_SELECT || state.phase === GAME_PHASE.STARTING_BONUS;
  // Hide player status bar during victory overlay to avoid duplicate info
  const hideStatusBar = hideChrome || isVictoryPhase;

  return (
    <div className="game-container">
      <DevTools />
      {!hideChrome && <PersistentHeader onPauseClick={handlePauseToggle} />}
      <Suspense fallback={<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Loading...</div>}>
        {renderPhase()}
      </Suspense>
      {!hideStatusBar && <PlayerStatusBar />}
      {isPaused && <PauseMenu onClose={handlePauseClose} />}
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
