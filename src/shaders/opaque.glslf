precision mediump float;

varying vec2 fTex;
varying vec3 fBG;
varying vec3 fFG;

uniform sampler2D uFont;

void main() {
  float p = texture2D(uFont, fTex).r;

  if (p > 0.5)
    gl_FragColor = vec4(fBG, 1);
  else
    gl_FragColor = vec4(fFG, 1);
}
