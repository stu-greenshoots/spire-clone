import { handleSelectCard, handleCancelTarget } from './combat/selectCardAction';
import { handlePlayCard } from './combat/playCardAction';
import { handleEndTurn } from './combat/endTurnAction';
import { GAME_PHASE } from '../GameContext';
import { shuffleArray } from '../../utils/mapGenerator';
import { handleExhaustTriggers } from '../../systems/effectProcessor';

function handleSelectCardFromPile(state, action) {
  const { card } = action.payload;
  const selection = state.cardSelection;
  if (!selection) return { ...state, phase: GAME_PHASE.COMBAT, cardSelection: null };

  let newHand = [...state.hand];
  let newDiscardPile = [...state.discardPile];
  let newDrawPile = [...state.drawPile];
  let newExhaustPile = [...state.exhaustPile];
  let combatLog = [...state.combatLog];

  switch (selection.type) {
    case 'discardToDrawTop': {
      const cardIndex = newDiscardPile.findIndex(c => c.instanceId === card.instanceId);
      if (cardIndex >= 0) {
        const [selectedCard] = newDiscardPile.splice(cardIndex, 1);
        newDrawPile.unshift(selectedCard);
        combatLog.push(`Put ${selectedCard.name} on top of draw pile`);
      }
      break;
    }

    case 'handToDrawTop': {
      const cardIndex = newHand.findIndex(c => c.instanceId === card.instanceId);
      if (cardIndex >= 0) {
        const [selectedCard] = newHand.splice(cardIndex, 1);
        newDrawPile.unshift(selectedCard);
        combatLog.push(`Put ${selectedCard.name} on top of draw pile`);
      }
      break;
    }

    case 'upgradeInHand': {
      if (selection.upgradeAll) {
        newHand = newHand.map(c => {
          if (!c.upgraded && c.upgradedVersion) {
            return { ...c, ...c.upgradedVersion, upgraded: true, name: c.name + '+' };
          }
          return c;
        });
        combatLog.push('Upgraded all cards in hand');
      } else {
        const cardIndex = newHand.findIndex(c => c.instanceId === card.instanceId);
        if (cardIndex >= 0 && newHand[cardIndex].upgradedVersion) {
          const upgraded = {
            ...newHand[cardIndex],
            ...newHand[cardIndex].upgradedVersion,
            upgraded: true,
            name: newHand[cardIndex].name + '+'
          };
          newHand[cardIndex] = upgraded;
          combatLog.push(`Upgraded ${upgraded.name}`);
        }
      }
      break;
    }

    case 'copyCardInHand': {
      const copies = selection.copies || 1;
      for (let i = 0; i < copies; i++) {
        newHand.push({ ...card, instanceId: `${card.id}_dw_${Date.now()}_${i}` });
      }
      combatLog.push(`Added ${copies} cop${copies > 1 ? 'ies' : 'y'} of ${card.name} to hand`);
      break;
    }

    case 'retrieveExhausted': {
      const cardIndex = newExhaustPile.findIndex(c => c.instanceId === card.instanceId);
      if (cardIndex >= 0) {
        const [selectedCard] = newExhaustPile.splice(cardIndex, 1);
        newHand.push(selectedCard);
        combatLog.push(`Returned ${selectedCard.name} from exhaust`);
      }
      break;
    }

    case 'exhaustChoose': {
      const cardIndex = newHand.findIndex(c => c.instanceId === card.instanceId);
      if (cardIndex >= 0) {
        const [exhaustedCard] = newHand.splice(cardIndex, 1);
        newExhaustPile.push(exhaustedCard);
        combatLog.push(`Exhausted ${exhaustedCard.name}`);
        const exhaustCtx = {
          player: { ...state.player },
          hand: newHand,
          drawPile: newDrawPile,
          discardPile: newDiscardPile,
          exhaustPile: newExhaustPile,
          relics: state.relics,
          combatLog
        };
        handleExhaustTriggers(exhaustCtx);
        return {
          ...state,
          phase: GAME_PHASE.COMBAT,
          cardSelection: null,
          hand: exhaustCtx.hand,
          discardPile: exhaustCtx.discardPile,
          drawPile: exhaustCtx.drawPile,
          exhaustPile: exhaustCtx.exhaustPile,
          player: exhaustCtx.player,
          combatLog: exhaustCtx.combatLog
        };
      }
      break;
    }
  }

  return {
    ...state,
    phase: GAME_PHASE.COMBAT,
    cardSelection: null,
    hand: newHand,
    discardPile: newDiscardPile,
    drawPile: newDrawPile,
    exhaustPile: newExhaustPile,
    combatLog
  };
}

export const combatReducer = (state, action) => {
  switch (action.type) {
    case 'SELECT_CARD':
      return handleSelectCard(state, action, combatReducer);

    case 'PLAY_CARD':
      return handlePlayCard(state, action);

    case 'CANCEL_TARGET':
      return handleCancelTarget(state);

    case 'END_TURN':
      return handleEndTurn(state);

    case 'SELECT_CARD_FROM_PILE':
      return handleSelectCardFromPile(state, action);

    case 'CANCEL_CARD_SELECTION':
      return { ...state, phase: GAME_PHASE.COMBAT, cardSelection: null };

    case 'SPAWN_ENEMIES': {
      const { enemies: newEnemies } = action.payload;
      return { ...state, enemies: [...state.enemies, ...newEnemies] };
    }

    default:
      return undefined; // Not handled by this reducer
  }
};
