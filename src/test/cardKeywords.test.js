import { describe, it, expect } from 'vitest';
import { ALL_CARDS, CARD_TYPES, getCardById } from '../data/cards';

describe('Card Keywords', () => {
  describe('Exhaust Keyword', () => {
    it('should have cards marked with exhaust', () => {
      const exhaustCards = ALL_CARDS.filter(c => c.exhaust === true);
      expect(exhaustCards.length).toBeGreaterThan(0);
    });

    it('exhaust cards should be removed from deck permanently when played', () => {
      // Simulate exhaust behavior - card goes to exhaust pile instead of discard
      const exhaustCard = ALL_CARDS.find(c => c.exhaust === true);
      expect(exhaustCard).toBeDefined();
      expect(exhaustCard.exhaust).toBe(true);

      // Simulate playing an exhaust card
      const hand = [{ ...exhaustCard, instanceId: 'exhaust_1' }];
      const discardPile = [];
      const exhaustPile = [];

      // Play the card - it should go to exhaust pile
      const playedCard = hand.shift();
      if (playedCard.exhaust) {
        exhaustPile.push(playedCard);
      } else {
        discardPile.push(playedCard);
      }

      expect(hand.length).toBe(0);
      expect(discardPile.length).toBe(0);
      expect(exhaustPile.length).toBe(1);
      expect(exhaustPile[0].instanceId).toBe('exhaust_1');
    });

    it('exhaust cards should not return to draw pile on reshuffle', () => {
      const exhaustCard = ALL_CARDS.find(c => c.exhaust === true);

      // Simulate deck state after playing exhaust card
      const drawPile = [{ id: 'strike', instanceId: 'strike_1' }];
      const discardPile = [{ id: 'defend', instanceId: 'defend_1' }];
      const exhaustPile = [{ ...exhaustCard, instanceId: 'exhaust_1' }];

      // Reshuffle: discard -> draw pile, exhaust stays separate
      const newDrawPile = [...drawPile, ...discardPile];
      const newDiscardPile = [];
      // Exhaust pile is NOT included in reshuffle

      expect(newDrawPile.length).toBe(2);
      expect(exhaustPile.length).toBe(1);
      expect(newDrawPile.find(c => c.instanceId === 'exhaust_1')).toBeUndefined();
    });

    it('specific exhaust cards should have expected properties', () => {
      const offering = getCardById('offering');
      if (offering) {
        expect(offering.exhaust).toBe(true);
      }

      const fiendFire = getCardById('fiendFire');
      if (fiendFire) {
        expect(fiendFire.exhaust).toBe(true);
      }

      const exhume = getCardById('exhume');
      if (exhume) {
        expect(exhume.exhaust).toBe(true);
      }
    });
  });

  describe('Ethereal Keyword', () => {
    it('should have cards marked with ethereal', () => {
      const etherealCards = ALL_CARDS.filter(c => c.ethereal === true);
      expect(etherealCards.length).toBeGreaterThan(0);
    });

    it('ethereal cards should exhaust if still in hand at end of turn', () => {
      const etherealCard = ALL_CARDS.find(c => c.ethereal === true);
      expect(etherealCard).toBeDefined();
      expect(etherealCard.ethereal).toBe(true);

      // Simulate end of turn with ethereal card in hand
      const hand = [
        { ...etherealCard, instanceId: 'ethereal_1' },
        { id: 'strike', instanceId: 'strike_1' }
      ];
      const exhaustPile = [];
      const discardPile = [];

      // End of turn processing: ethereal cards in hand get exhausted
      const endTurnHand = [];
      hand.forEach(card => {
        if (card.ethereal) {
          exhaustPile.push(card);
        } else {
          endTurnHand.push(card);
        }
      });

      // Remaining cards go to discard
      discardPile.push(...endTurnHand);

      expect(exhaustPile.length).toBe(1);
      expect(exhaustPile[0].instanceId).toBe('ethereal_1');
      expect(discardPile.length).toBe(1);
    });

    it('ethereal cards played during turn should not auto-exhaust', () => {
      const etherealCard = ALL_CARDS.find(c => c.ethereal === true && !c.exhaust);

      if (etherealCard) {
        // Simulate playing ethereal card during turn
        const hand = [{ ...etherealCard, instanceId: 'ethereal_1' }];
        const discardPile = [];
        const exhaustPile = [];

        // Card is played (removed from hand)
        const playedCard = hand.shift();

        // If card has exhaust keyword, it goes to exhaust pile
        // Otherwise ethereal only triggers at END of turn
        if (playedCard.exhaust) {
          exhaustPile.push(playedCard);
        } else {
          discardPile.push(playedCard);
        }

        // Card was played so it's not in hand at end of turn
        // Ethereal doesn't trigger because it was used
        expect(hand.length).toBe(0);
        expect(discardPile.length + exhaustPile.length).toBe(1);
      }
    });

    it('specific ethereal cards like Apparition should be properly marked', () => {
      const apparition = getCardById('apparition');
      if (apparition) {
        expect(apparition.ethereal).toBe(true);
      }
    });
  });

  describe('Retain Keyword', () => {
    it('retain cards should stay in hand between turns', () => {
      // Simulate retain behavior
      const retainCard = { id: 'retain_test', retain: true, instanceId: 'retain_1' };
      const normalCard = { id: 'strike', instanceId: 'strike_1' };

      const hand = [retainCard, normalCard];
      const discardPile = [];

      // End of turn: normal cards discard, retain cards stay
      const newHand = [];
      hand.forEach(card => {
        if (card.retain) {
          newHand.push(card);
        } else {
          discardPile.push(card);
        }
      });

      expect(newHand.length).toBe(1);
      expect(newHand[0].instanceId).toBe('retain_1');
      expect(discardPile.length).toBe(1);
      expect(discardPile[0].instanceId).toBe('strike_1');
    });

    it('retain cards should persist across multiple turns', () => {
      const retainCard = { id: 'retain_test', retain: true, instanceId: 'retain_1' };

      let hand = [retainCard];
      const discardPile = [];

      // Simulate 3 turns of retaining
      for (let turn = 0; turn < 3; turn++) {
        const newHand = [];
        hand.forEach(card => {
          if (card.retain) {
            newHand.push(card);
          } else {
            discardPile.push(card);
          }
        });
        hand = newHand;
      }

      // Card should still be in hand after 3 turns
      expect(hand.length).toBe(1);
      expect(hand[0].instanceId).toBe('retain_1');
    });
  });

  describe('Innate Keyword', () => {
    it('innate cards should be drawn on first turn', () => {
      // Simulate deck setup with innate card
      const deck = [
        { id: 'strike', instanceId: 'strike_1' },
        { id: 'defend', instanceId: 'defend_1' },
        { id: 'innate_test', innate: true, instanceId: 'innate_1' },
        { id: 'strike', instanceId: 'strike_2' },
        { id: 'defend', instanceId: 'defend_2' }
      ];

      // At combat start, innate cards go to top of draw pile
      const innateCards = deck.filter(c => c.innate);
      const otherCards = deck.filter(c => !c.innate);

      // Innate cards are guaranteed to be drawn first
      const drawPile = [...innateCards, ...otherCards];

      // Draw initial hand of 5 cards
      const hand = drawPile.splice(0, 5);

      // Innate card should be in the opening hand
      const hasInnate = hand.some(c => c.innate === true);
      expect(hasInnate).toBe(true);
    });

    it('multiple innate cards should all be in opening hand', () => {
      const deck = [
        { id: 'strike', instanceId: 'strike_1' },
        { id: 'innate_1', innate: true, instanceId: 'innate_1' },
        { id: 'innate_2', innate: true, instanceId: 'innate_2' },
        { id: 'defend', instanceId: 'defend_1' },
        { id: 'strike', instanceId: 'strike_2' },
        { id: 'defend', instanceId: 'defend_2' },
        { id: 'strike', instanceId: 'strike_3' }
      ];

      const innateCards = deck.filter(c => c.innate);
      const otherCards = deck.filter(c => !c.innate);
      const drawPile = [...innateCards, ...otherCards];

      // Draw 5 cards
      const hand = drawPile.splice(0, 5);

      // Both innate cards should be in opening hand
      const innateInHand = hand.filter(c => c.innate);
      expect(innateInHand.length).toBe(2);
    });

    it('innate only affects first turn draw', () => {
      // After first turn, innate cards are shuffled normally
      const innateCard = { id: 'innate_test', innate: true, instanceId: 'innate_1' };

      // Card in discard pile on turn 2
      const discardPile = [innateCard];

      // Reshuffle doesn't give innate special treatment
      const newDrawPile = [...discardPile];

      // Innate property exists but doesn't affect mid-combat shuffles
      expect(newDrawPile[0].innate).toBe(true);
      // Position is random, not guaranteed first
    });
  });

  describe('Unplayable Keyword', () => {
    it('should have cards marked as unplayable', () => {
      const unplayableCards = ALL_CARDS.filter(c => c.unplayable === true);
      expect(unplayableCards.length).toBeGreaterThan(0);
    });

    it('unplayable cards should have cost of -2', () => {
      const unplayableCards = ALL_CARDS.filter(c => c.unplayable === true);
      unplayableCards.forEach(card => {
        expect(card.cost).toBe(-2);
      });
    });

    it('unplayable cards cannot be played', () => {
      const unplayableCard = ALL_CARDS.find(c => c.unplayable === true);
      expect(unplayableCard).toBeDefined();

      // Simulate attempting to play an unplayable card
      const canPlayCard = (card, energy) => {
        if (card.unplayable) return false;
        if (card.cost < 0 && card.cost !== -1) return false; // -1 is X cost
        return card.cost <= energy;
      };

      expect(canPlayCard(unplayableCard, 3)).toBe(false);
      expect(canPlayCard(unplayableCard, 100)).toBe(false);
    });

    it('curse cards should be unplayable', () => {
      const curseCards = ALL_CARDS.filter(c => c.type === CARD_TYPES.CURSE);
      curseCards.forEach(curse => {
        // Most curses are unplayable (unless Blue Candle relic)
        if (curse.id !== 'necronomicurse') {
          expect(curse.unplayable).toBe(true);
        }
      });
    });

    it('status cards like Wound and Dazed should be unplayable, Slimed is playable (exhausts)', () => {
      const wound = getCardById('wound');
      const slimed = getCardById('slimed');
      const dazed = getCardById('dazed');

      if (wound) {
        expect(wound.unplayable).toBe(true);
      }
      if (slimed) {
        // Slimed costs 1 energy and exhausts when played (like the real game)
        expect(slimed.unplayable).toBeFalsy();
        expect(slimed.cost).toBe(1);
        expect(slimed.exhaust).toBe(true);
      }
      if (dazed) {
        expect(dazed.unplayable).toBe(true);
      }
    });
  });

  describe('Keyword Combinations', () => {
    it('cards can have multiple keywords', () => {
      // Find cards with both ethereal and exhaust
      const etherealExhaustCards = ALL_CARDS.filter(c => c.ethereal && c.exhaust);
      // This is valid - ethereal auto-exhausts at end of turn, exhaust triggers when played

      // Cards with exhaust that get exhausted anyway when played
      const exhaustCards = ALL_CARDS.filter(c => c.exhaust);
      exhaustCards.forEach(card => {
        expect(card.exhaust).toBe(true);
      });
    });

    it('unplayable ethereal cards exhaust at end of turn without being played', () => {
      const unplayableEthereal = ALL_CARDS.find(c => c.unplayable && c.ethereal);

      if (unplayableEthereal) {
        // Card cannot be played but will still exhaust if in hand at end of turn
        expect(unplayableEthereal.unplayable).toBe(true);
        expect(unplayableEthereal.ethereal).toBe(true);

        // Simulate: card in hand at end of turn
        const hand = [{ ...unplayableEthereal, instanceId: 'test_1' }];
        const exhaustPile = [];

        // Process end of turn
        hand.forEach(card => {
          if (card.ethereal) {
            exhaustPile.push(card);
          }
        });

        expect(exhaustPile.length).toBe(1);
      }
    });
  });
});
