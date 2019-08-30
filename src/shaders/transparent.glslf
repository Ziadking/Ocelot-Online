precision mediump float;

varying vec2 fTex;
varying vec4 fBG;
varying vec4 fFG;

uniform sampler2D uFont;

void main() {
  float p = texture2D(uFont, fTex).r;

  if (p > 0.5)
    gl_FragColor = fBG;
  else
    gl_FragColor = fFG;
}
