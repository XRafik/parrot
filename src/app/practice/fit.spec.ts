import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fitTo } from './fit';

/**
 * fit() shrinks the sentence's type until the text fits the box, or down to the
 * 18 px floor (longer text keeps scrolling). The layout engine is stood in for
 * by mocking the element's dimension getters as a function of the current font
 * size (read back off the inline style), the way a real element would report
 * them. getComputedStyle is mocked to report the CSS size the text started at
 * (the .sentence class), since fitTo clears the inline style before reading it.
 */
function sentenceBox(scroll: (size: number) => number, clientW: number, clientH: number, initial: number) {
  const el = document.createElement('p');
  document.body.appendChild(el);
  const size = () => {
    const m = el.style.fontSize.match(/([\d.]+)px/);
    return m ? parseFloat(m[1]) : initial;
  };
  vi.spyOn(el, 'scrollWidth', 'get').mockImplementation(() => scroll(size()));
  vi.spyOn(el, 'scrollHeight', 'get').mockReturnValue(0);
  vi.spyOn(el, 'clientWidth', 'get').mockReturnValue(clientW);
  vi.spyOn(el, 'clientHeight', 'get').mockReturnValue(clientH);
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({ fontSize: `${initial}px` } as CSSStyleDeclaration);
  return el;
}

describe('fitTo', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('shrinks a word that overflows the box sideways down to where it fits (a URL in a sentence)', () => {
    // at 33 px the 54-char URL is 502 px wide in a 316 px box: the sentence
    // used to scroll 202 px sideways. Shrinking must continue until it holds.
    const el = sentenceBox((s) => (s >= 25 ? 502 : 300), 316, 400, 33);
    expect(fitTo(el)).toBe(24);
    expect(el.style.fontSize).toBe('24px');
  });

  it('keeps a word that already fits in both directions at full size', () => {
    const el = sentenceBox(() => 300, 316, 400, 33);
    expect(fitTo(el)).toBe(33);
    // nothing was shrunken: the class's own size stays in charge
    expect(el.style.fontSize).toBe('');
  });

  it('still shrinks text that overflows the height, as before', () => {
    const el = sentenceBox(() => 0, 316, 400, 33);
    vi.spyOn(el, 'scrollHeight', 'get').mockImplementation(() => (el.style.fontSize === '18px' ? 380 : 430));
    expect(fitTo(el)).toBe(18);
  });

  it('never shrinks below the 18 px floor (longer text keeps scrolling)', () => {
    const el = sentenceBox(() => 900, 316, 400, 20);
    expect(fitTo(el)).toBe(18);
  });
});
