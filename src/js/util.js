// util methods
// --------------------------------------------------------------------------------- //

export function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  return [r, g, b];
}

export function lightness(r, g, b) {
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  return (max + min) / 2;
}

var fancyAlphaThreshold = 80;
export function fancyAlpha(r, g, b) {
  var l = lightness(r, g, b);
  if (l > fancyAlphaThreshold) return 1.0;
  else return 0.8 + (l / fancyAlphaThreshold) * 0.2;
}

export function isMobile() {
  return typeof window.orientation !== 'undefined';
}
