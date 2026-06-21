precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform sampler2D uBase;
uniform sampler2D uCausticMask1;
uniform sampler2D uCausticMask2;
uniform vec2 uResolution;

#include <noise>

float bubbleMaskGrad(float y) {
    if (y < 0.278) return mix(0.389, 0.0, y / 0.278);
    if (y < 0.763) return 0.0;
    return mix(0.0, 0.252, (y - 0.763) / (1.0 - 0.763));
}

void main() {
    float amp = 0.02;
    float spd = 0.5;
    float wl = 0.08;
    vec2 duv = vec2(amp) + vUv * (1.0 - amp * 2.0);
    duv += vec2(0.0, sin(vUv.x / wl + uTime * spd)) * amp;
    vec3 col = texture2D(uBase, duv).rgb;

    col = mix(col, vec3(0.0, 0.498, 0.824), 0.824);

    float st = floor(uTime * 6.0) / 6.0;
    {
        float yMin = 0.15;
        if (vUv.y >= yMin) {
            vec2 luv = vec2(vUv.x, (vUv.y - yMin) / (1.0 - yMin));
            float p1 = fbm(vec2(0.5) * luv + vec2(0.0, 0.07) * st, 4.0);
            float p2 = fbm(vec2(1.0, 4.0) * luv + 0.5 + vec2(0.0, -0.1) * st, 4.0);
            float bub = fbm(vec2(1.6, 0.9) * luv + 0.5 + vec2(0.0, -0.13) * st, 6.0);
            float pmask = texture2D(uCausticMask1, luv).r;
            float bmask = bubbleMaskGrad(luv.y);
            float pat = step(0.79, pmask - abs(p1 - p2));
            float bp1 = step(0.79, bub - pat - bmask);
            float bp2 = step(0.21, pat - bub);
            float a = (bp1 + bp2) * 0.255;
            col += vec3(0.331, 0.929, 0.919) * a;
        }
    }

    {
        vec2 cMin = vec2(0.642, 0.541);
        vec2 cMax = vec2(0.908, 1.015);
        if (vUv.x >= cMin.x && vUv.x <= cMax.x && vUv.y >= cMin.y && vUv.y <= cMax.y) {
            vec2 luv = (vUv - cMin) / (cMax - cMin);
            float p1 = fbm(luv + vec2(0.0, 0.1) * st, 5.0);
            float p2 = fbm(vec2(1.0, 2.0) * luv + 0.5 + vec2(0.0, -0.25) * st, 5.0);
            float mask = texture2D(uCausticMask2, luv).r;
            float pat = step(0.48, mask - abs(p1 - p2));
            float a = pat * 0.471;
            col += vec3(0.587, 0.888, 0.939) * a;
        }
    }

    gl_FragColor = vec4(col, 1.0);
}
