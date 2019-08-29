attribute vec2 inRectPos;
attribute vec2 inPos;
attribute vec2 inTex;
attribute vec3 inBG;
attribute vec3 inFG;

varying vec2 fTex;
varying vec3 fBG;
varying vec3 fFG;

uniform vec2 uCharSize;
uniform vec2 uGlyphSize;

void main() {
  fTex = inTex + (inRectPos * vec2(1, -1) + vec2(0, 1)) * uGlyphSize;
  fBG = inBG;
  fFG = inFG;

  gl_Position = vec4(inPos + inRectPos * uCharSize, 0, 1);
}
