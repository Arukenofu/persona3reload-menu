precision highp float;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uPixelSize;

float gauss(float x, float sigma) {
    return exp(-(x * x) / (2.0 * sigma * sigma)) / (sqrt(2.0 * 3.14159265) * sigma);
}

void main() {
    const float sigma = 1.4;
    const int radius = 4;
    vec3 sum = vec3(0.0);
    float totalW = 0.0;
    for (int i = -radius; i <= radius; i++) {
        for (int j = -radius; j <= radius; j++) {
            vec2 offset = vec2(float(i), float(j)) * uPixelSize;
            float w = gauss(float(i), sigma) * gauss(float(j), sigma);
            sum += texture2D(uTexture, vUv + offset).rgb * w;
            totalW += w;
        }
    }
    gl_FragColor = vec4(sum / totalW, 1.0);
}
