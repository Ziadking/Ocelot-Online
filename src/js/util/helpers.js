// util methods
// --------------------------------------------------------------------------------- //

export function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  return [r, g, b];
}

export function lightness(r, g, b) {
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);

  return (max + min) / 2;
}

const FANCY_ALPHA_TRESHOLD = 80;

export function fancyAlpha(r, g, b) {
  let l = lightness(r, g, b);

  if (l > FANCY_ALPHA_TRESHOLD)
    return 1.0;
  else
    return 0.8 + (l / FANCY_ALPHA_TRESHOLD) * 0.2;
}

export function isMobile() {
  return typeof window.orientation !== 'undefined';
}
