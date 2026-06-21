precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uShowWhite;

vec4 gradientDark(vec2 uv) {
    float t = clamp((1.0 - uv.x + uv.y) * 0.5, 0.0, 1.0);
    vec4 c0 = vec4(0.0, 0.061, 0.429, 1.0);
    vec4 c1 = vec4(0.0, 0.027, 0.486, 0.784);
    vec4 c2 = vec4(0.065, 0.263, 0.963, 0.0);
    if (t <= 0.0746) return mix(c0, c1, t / 0.0746);
    return mix(c1, c2, (t - 0.0746) / (1.0 - 0.0746));
}

vec4 gradientLight(vec2 uv) {
    float t = clamp((1.0 - uv.x + uv.y) * 0.5, 0.0, 1.0);
    vec4 c0 = vec4(0.282, 0.427, 0.867, 0.0);
    vec4 c1 = vec4(0.0, 0.988, 0.949, 0.392);
    if (t <= 0.468) return c0;
    return mix(c0, c1, (t - 0.468) / (1.0 - 0.468));
}

void main() {
    vec3 col = texture2D(uTexture, vUv).rgb;

    vec4 dark = gradientDark(vUv);
    col = mix(col, dark.rgb, dark.a);

    vec4 light = gradientLight(vUv);
    col += light.rgb * light.a;

    if (uShowWhite > 0.5) {
        float edge = 0.210 + 0.194 * vUv.y;
        float aa = fwidth(vUv.x) * 1.5;
        float whiteMask = smoothstep(edge + aa, edge - aa, vUv.x);
        col = mix(col, vec3(1.0), whiteMask);
    }

    gl_FragColor = vec4(col, 1.0);
}
