import { describe, it, expect } from 'vitest';
import { getEndlessBackgroundStyle } from '../assets/art/art-config';

describe('GD-31: Endless Mode Visual Escalation', () => {
  it('returns a background style object', () => {
    const style = getEndlessBackgroundStyle(0);
    expect(style).toHaveProperty('background');
    expect(style.background).toContain('radial-gradient');
  });

  it('returns different gradients for different loop tiers', () => {
    const style0 = getEndlessBackgroundStyle(0);
    const style3 = getEndlessBackgroundStyle(3);
    const style7 = getEndlessBackgroundStyle(7);
    const style10 = getEndlessBackgroundStyle(10);

    expect(style0.background).not.toBe(style3.background);
    expect(style3.background).not.toBe(style7.background);
    expect(style7.background).not.toBe(style10.background);
  });

  it('caps escalation at tier 10', () => {
    const style10 = getEndlessBackgroundStyle(10);
    const style15 = getEndlessBackgroundStyle(15);
    const style100 = getEndlessBackgroundStyle(100);

    expect(style10.background).toBe(style15.background);
    expect(style10.background).toBe(style100.background);
  });

  it('produces valid HSL values in gradient', () => {
    for (let loop = 0; loop <= 12; loop++) {
      const style = getEndlessBackgroundStyle(loop);
      // Extract all hsl() values
      const hslMatches = style.background.matchAll(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/g);
      for (const match of hslMatches) {
        const [, h, s, l] = match.map(Number);
        expect(h).toBeGreaterThanOrEqual(0);
        expect(h).toBeLessThanOrEqual(360);
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(100);
        expect(l).toBeGreaterThanOrEqual(0);
        expect(l).toBeLessThanOrEqual(100);
      }
    }
  });

  it('shifts hue from warm to cool as loops increase', () => {
    const style0 = getEndlessBackgroundStyle(0);
    const style10 = getEndlessBackgroundStyle(10);

    // Extract first hue value from each
    const getFirstHue = (bg) => {
      const match = bg.match(/hsl\((\d+)/);
      return match ? Number(match[1]) : null;
    };

    const hue0 = getFirstHue(style0.background);
    const hue10 = getFirstHue(style10.background);

    // Hue should decrease (warm purple → cool blue)
    expect(hue0).toBeGreaterThan(hue10);
  });

  it('handles loop 0 (first endless entry) gracefully', () => {
    const style = getEndlessBackgroundStyle(0);
    expect(style.background).toBeTruthy();
    // Loop 0 should be close to the default purple theme
    expect(style.background).toContain('hsl(270');
  });
});
