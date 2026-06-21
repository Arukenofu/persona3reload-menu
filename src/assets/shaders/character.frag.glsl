precision highp float;

uniform sampler2D uAlbedo;
uniform sampler2D uBackground;
uniform vec2 uResolution;
uniform float uFresnelThickness;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

float fresnel(float amount, vec3 normal, vec3 view) {
  return pow(1.0 - clamp(dot(normalize(normal), normalize(view)), 0.0, 1.0), amount);
}

void main() {
  vec2 screenUV = gl_FragCoord.xy / uResolution;
  vec4 background = texture2D(uBackground, screenUV);
  vec4 albedo = texture2D(uAlbedo, vUv);

  float f = fresnel(uFresnelThickness, vNormal, vViewDir);
  float mixValue = albedo.a * (1.0 - albedo.b * f);

  vec3 color = mix(background.rgb, albedo.rgb, mixValue);
  gl_FragColor = vec4(color, 1.0);
}
