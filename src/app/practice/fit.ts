/**
 * Shrink a sentence's type until it fits the box in both directions, or down to
 * the 18 px floor (longer text keeps scrolling).
 *
 * Reads the element's live `scrollWidth`/`scrollHeight` and `clientWidth`/
 * `clientHeight` after each change, so it can stand in for the layout engine in
 * a test. The old loop only watched the height: an unbreakable word (a URL, a
 * long token) that ran past the right edge kept the sentence scrolling sideways
 * even when it fit comfortably in height. The width is checked now; on the
 * style side `overflow-wrap: anywhere` on each word is what lets such a word
 * break instead of forcing that sideways scroll.
 */
export function fitTo(el: HTMLElement): number {
  el.style.fontSize = '';
  let size = parseFloat(getComputedStyle(el).fontSize);
  while ((el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) && size > 18) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
  return size;
}
