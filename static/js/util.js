// util methods
// --------------------------------------------------------------------------------- //

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  return [r, g, b];
}

function lightness(r, g, b) {
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  return (max + min) / 2;
}

var fancyAlphaThreshold = 80;
function fancyAlpha(r, g, b) {
  var l = lightness(r, g, b);
  if (l > fancyAlphaThreshold) return 1.0;
  else return 0.8 + (l / fancyAlphaThreshold) * 0.2;
}

function isMobile() {
  return typeof window.orientation !== 'undefined';
}
