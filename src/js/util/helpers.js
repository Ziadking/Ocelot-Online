// util methods
// --------------------------------------------------------------------------------- //

/** Returns an array with RGB values corresponding to a single value of 0xRRGGBB format */
export function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  return [r, g, b];
}

/** Calculates a relative color lightness */
export function lightness(r, g, b) {
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  return (max + min) / 2;
}

const FANCY_ALPHA_TRESHOLD = 80;

/**
 * Calculate alpha channel value for the given color.
 * Usually the bright colors will be opaque, and dark colors will be transparent.
 */
export function fancyAlpha(r, g, b) {
  let l = lightness(r, g, b);

  if (l > FANCY_ALPHA_TRESHOLD)
    return 1.0;
  else
    return 0.8 + (l / FANCY_ALPHA_TRESHOLD) * 0.2;
}

/** Check if Ocelot is running in mobile environment */
export function isMobile() {
  return typeof window.orientation !== 'undefined';
}

/**
 * Makes an element flash with red color for a second.
 * Set `fore` to true to flash text, and `back` to flash background.
 */
export function flash(element, fore, back) {
  element.classList.remove("warning-f");
  element.classList.remove("warning-b");
  void element.offsetWidth; // black magic - triggering element reflow
  if (fore) element.classList.add("warning-f");
  if (back) element.classList.add("warning-b");
}

/**
 * Return width of the browser window
 */
export function getWidth() {
  return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
}

/**
 * Return height of the browser window
 */
export function getHeight() {
  return window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
}

/**
 * Generate left and top style parameters for an object with given size.
 */
export function leftTop(x, y, width, height) {
  let left = x - width / 2;
  let top = y - height / 2;
  return "left: " + left + "px; top: " + top + "px;";
}


let utf8encoder = new TextEncoder('utf-8');
let utf8decoder = new TextDecoder('utf-8');

/**
 * Return byte array with a `str` encoded as UTF-8.
 */
export function encodeString(str) {
  return utf8encoder.encode(str);
}

/**
 * Return a string decoded from byte array (buffer) as UTF-8.
 */
export function decodeString(buffer) {
  return utf8decoder.decode(buffer);
}
