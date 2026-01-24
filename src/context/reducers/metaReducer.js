import { GAME_PHASE, createInitialState } from '../constants';
import { getStarterDeck, getCardById } from '../../data/cards';
import { getStarterRelic, getRelicById, getRandomRelic } from '../../data/relics';
import { generateMap } from '../../utils/mapGenerator';
import { saveGame, loadGame, deleteSave } from '../../systems/saveSystem';
import { getPassiveRelicEffects } from '../../systems/relicSystem';

export const metaReducer = (state, action) => {
  switch (action.type) {
    case 'START_GAME': {
      // Delete any existing save when starting new game
      deleteSave();
      const deck = getStarterDeck();
      const starterRelic = getStarterRelic();
      const map = generateMap(1);

      return {
        ...createInitialState(),
        phase: GAME_PHASE.MAP,
        deck,
        relics: [starterRelic],
        map,
        currentFloor: -1
      };
    }

    case 'REST': {
      let healAmount = Math.floor(state.player.maxHp * 0.3);

      // Eternal Feather: heal 3 HP for every 5 cards in deck
      const eternalFeather = state.relics.find(r => r.id === 'eternal_feather');
      if (eternalFeather) {
        healAmount += Math.floor(state.deck.length / 5) * 3;
      }

      // Magic Flower: 50% more healing
      const passiveEffects = getPassiveRelicEffects(state.relics, {});
      healAmount = Math.floor(healAmount * passiveEffects.healingMultiplier);

      const newState = {
        ...state,
        player: {
          ...state.player,
          currentHp: Math.min(state.player.maxHp, state.player.currentHp + healAmount)
        },
        phase: GAME_PHASE.MAP
      };
      // Auto-save after resting
      saveGame(newState);
      return newState;
    }

    case 'UPGRADE_CARD': {
      const { cardIndex } = action.payload;
      const card = state.deck[cardIndex];
      if (!card || card.upgraded || !card.upgradedVersion) {
        const noUpgradeState = {
          ...state,
          phase: GAME_PHASE.MAP
        };
        saveGame(noUpgradeState);
        return noUpgradeState;
      }

      const upgradedCard = {
        ...card,
        ...card.upgradedVersion,
        upgraded: true,
        name: card.name + '+'
      };

      const newDeck = [...state.deck];
      newDeck[cardIndex] = upgradedCard;

      const upgradeState = {
        ...state,
        deck: newDeck,
        phase: GAME_PHASE.MAP
      };
      // Auto-save after upgrading
      saveGame(upgradeState);
      return upgradeState;
    }

    case 'SKIP_EVENT': {
      const skipState = {
        ...state,
        phase: GAME_PHASE.MAP
      };
      saveGame(skipState);
      return skipState;
    }

    case 'APPLY_EVENT_CHOICE': {
      const { effects } = action.payload;
      let newPlayer = { ...state.player };
      let newDeck = [...state.deck];
      let newRelics = [...state.relics];

      if (effects.loseGold) newPlayer.gold = Math.max(0, newPlayer.gold - effects.loseGold);
      if (effects.gainGold) newPlayer.gold += effects.gainGold;
      if (effects.heal) newPlayer.currentHp = Math.min(newPlayer.maxHp, newPlayer.currentHp + effects.heal);
      if (effects.damage) newPlayer.currentHp = Math.max(1, newPlayer.currentHp - effects.damage);
      if (effects.loseHp) newPlayer.currentHp = Math.max(1, newPlayer.currentHp - effects.loseHp);
      if (effects.loseHpPercent) {
        const loss = Math.floor(newPlayer.maxHp * effects.loseHpPercent / 100);
        newPlayer.currentHp = Math.max(1, newPlayer.currentHp - loss);
      }
      if (effects.gainMaxHp) {
        newPlayer.maxHp += effects.gainMaxHp;
        newPlayer.currentHp += effects.gainMaxHp;
      }
      if (effects.upgradeRandomCard) {
        const upgradable = newDeck.filter(c => !c.upgraded && c.upgradedVersion);
        if (upgradable.length > 0) {
          const target = upgradable[Math.floor(Math.random() * upgradable.length)];
          const idx = newDeck.findIndex(c => c.instanceId === target.instanceId);
          if (idx >= 0) {
            newDeck[idx] = { ...target, ...target.upgradedVersion, upgraded: true, name: target.name + '+' };
          }
        }
      }
      if (effects.gainRelic) {
        const relic = effects.gainRelic === 'random_uncommon'
          ? getRandomRelic('uncommon', newRelics.map(r => r.id))
          : getRelicById(effects.gainRelic);
        if (relic) newRelics.push(relic);
      }
      if (effects.removeCard && newDeck.length > 0) {
        const idx = Math.floor(Math.random() * newDeck.length);
        newDeck.splice(idx, 1);
      }

      const eventState = {
        ...state,
        player: newPlayer,
        deck: newDeck,
        relics: newRelics,
        phase: GAME_PHASE.MAP
      };
      saveGame(eventState);
      return eventState;
    }

    case 'RETURN_TO_MENU': {
      return createInitialState();
    }

    case 'OPEN_DATA_EDITOR': {
      return { ...createInitialState(), phase: GAME_PHASE.DATA_EDITOR };
    }

    case 'LIFT_GIRYA': {
      const girya = state.relics.find(r => r.id === 'girya');
      if (!girya || girya.liftCount >= 3) {
        return { ...state, phase: GAME_PHASE.MAP };
      }

      const newRelics = state.relics.map(r => {
        if (r.id === 'girya') {
          return { ...r, liftCount: (r.liftCount || 0) + 1 };
        }
        return r;
      });

      return {
        ...state,
        player: {
          ...state.player,
          strength: state.player.strength + 1
        },
        relics: newRelics,
        phase: GAME_PHASE.MAP
      };
    }

    case 'SAVE_GAME': {
      saveGame(state);
      return state;
    }

    case 'LOAD_GAME': {
      const saveData = loadGame();
      if (!saveData) return state;

      // Reconstruct deck from card IDs
      const deck = saveData.deck.map((cardId, index) => {
        const baseCard = getCardById(cardId);
        if (!baseCard) return null;
        return { ...baseCard, instanceId: `${cardId}_${index}` };
      }).filter(Boolean);

      // Reconstruct relics from relic IDs
      const relics = saveData.relics.map(relicId => {
        const baseRelic = getRelicById(relicId);
        if (!baseRelic) return null;
        return { ...baseRelic };
      }).filter(Boolean);

      return {
        ...createInitialState(),
        phase: GAME_PHASE.MAP,
        player: {
          ...createInitialState().player,
          currentHp: saveData.player.hp,
          maxHp: saveData.player.maxHp,
          gold: saveData.player.gold,
        },
        deck,
        relics,
        map: saveData.map,
        currentNode: saveData.currentNode,
        currentFloor: saveData.floor,
        act: saveData.act,
      };
    }

    case 'DELETE_SAVE': {
      deleteSave();
      return state;
    }

    default:
      return undefined; // Not handled by this reducer
  }
};
