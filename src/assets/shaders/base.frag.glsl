precision highp float;
varying vec2 vUv;
uniform float uTime;

#include <noise>

vec3 colorMap(float t) {
    const vec3 c0 = vec3(0.0235, 0.0392, 0.1686);
    const vec3 c1 = vec3(0.0471, 0.0706, 0.2980);
    const vec3 c2 = vec3(0.1059, 0.2196, 0.9412);
    const vec3 c3 = vec3(0.2000, 0.3176, 1.0000);
    const vec3 c4 = vec3(0.9882, 0.9961, 0.9961);
    const float s1 = 0.3089;
    const float s2 = 0.4797;
    const float s3 = 0.7683;
    const float s4 = 0.8130;
    if (t <= 0.0) return c0;
    if (t <= s1) return mix(c0, c1, t / s1);
    if (t <= s2) return mix(c1, c2, (t - s1) / (s2 - s1));
    if (t <= s3) return mix(c2, c3, (t - s2) / (s3 - s2));
    if (t <= s4) return mix(c3, c4, (t - s3) / (s4 - s3));
    return c4;
}

void main() {
    float n = fbm(vUv + uTime * 0.02, 3.0);
    n += 0.3 * snoise(vUv * 1.5 - uTime * 0.015);
    n = clamp(n, 0.0, 1.0);
    float brightness = 0.299 * n + 0.587 * n + 0.114 * n;
    gl_FragColor = vec4(colorMap(brightness), 1.0);
}
