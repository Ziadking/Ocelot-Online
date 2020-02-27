precision mediump float;

varying vec2 fTex;
varying vec3 fBG;
varying vec3 fFG;

uniform sampler2D uFont;
uniform sampler2D uMask;
uniform vec2 uResolution;

float lightness(vec3 col) {
  float max = max(max(col.r, col.g), col.b);
  float min = min(min(col.r, col.g), col.b);
  return (max + min) / 2.0;
}

float fancyAlpha(vec3 col) {
  const float TRESH = 0.3125;
  float l = lightness(col);
  if (l > TRESH)
    return 1.0;
  else
    return 0.8 + (l / TRESH) * 0.2;
}

vec3 blend(vec4 src, vec4 dst) {
  float outA = src.a + dst.a * (1.0 - dst.a);
  vec3 outC = (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / outA;
  return outC;
}

void main() {
  float p = texture2D(uFont, fTex).r;
  vec3 color = mix(fFG, fBG, p);
  float alpha = fancyAlpha(color);

  vec2 maskTex = gl_FragCoord.xy * vec2(1, -1) + vec2(0, 1) * uResolution;
  maskTex -= uResolution / 2.0 - 128.0;
  maskTex /= 256.0;
  float mask = texture2D(uMask, maskTex).r;

  vec3 maskColor = vec3(mask * 0.12 + 0.3);
  float maskAlpha = 1.0;

  vec3 finalColor = blend(vec4(color, alpha), vec4(maskColor, maskAlpha));
  gl_FragColor = vec4(finalColor, 1.0);
}
