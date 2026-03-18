#version 320 es

precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

uniform float time;

out vec4 fragColor;

#define M_PI 3.1415926535897932384626433832795

// #define ReplaceThreshold 0.4
// #define ReplaceColor 0.0,0.0,0.0
#define ReplaceThreshold 0.3
#define ReplaceColor 1.0,0.0,1.0

// #define Distored_Position
// #define Distored_Color

#ifdef Distored_Position
#define Use_Weight
#else
#ifdef Distored_Color
#define Use_Weight
#endif
#endif

vec3 RotateColor(vec3 c, float angle) {
    float U = cos(angle * M_PI);
    float W = sin(angle * M_PI);

    vec3 ret;
    ret.r = (.299 + .701 * U + .168 * W) * c.r
            + (.587 - .587 * U + .330 * W) * c.g
            + (.114 - .114 * U - .497 * W) * c.b;

    ret.g = (.299 - .299 * U - .328 * W) * c.r
            + (.587 + .413 * U + .035 * W) * c.g
            + (.114 - .114 * U + .292 * W) * c.b;

    ret.b = (.299 - .3 * U + 1.25 * W) * c.r
            + (.587 - .588 * U - 1.05 * W) * c.g
            + (.114 + .886 * U - .203 * W) * c.b;

    return ret;
}

int MaxIter = 10;

float isRainbow(vec2 uv) {
    ivec2 texsize = textureSize(tex, 0);
    vec2 texelsize = vec2(1.0) / vec2(texsize.x, texsize.y);

    float Rainbow = 0.0;

    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            vec3 color = texture(tex, uv + vec2(x, 0) * texelsize.x + vec2(0, y) * texelsize.y).rgb;
            Rainbow = max(float(int(abs(length(color - vec3(ReplaceColor))) < ReplaceThreshold)), Rainbow);
        }
    }
    vec3 color = texture(tex, uv).rgb;
    Rainbow = min(float(int(abs(length(color - vec3(1.0, 0.0, 1.0))) < (3.0 * ReplaceThreshold))), Rainbow);
    return Rainbow;
}

vec3 ToRainbow(vec2 uv, float off) {
    float isRainbow = isRainbow(uv);

    vec3 color = texture(tex, uv).rgb;

    vec3 Rainbow = vec3((sin(off) + 1.0) / 2.0, (sin(off + 2.0 * M_PI / 3.0) + 1.0) / 2.0, (sin(off + 4.0 * M_PI / 3.0) + 1.0) / 2.0);

    return isRainbow * Rainbow + (1.0 - isRainbow) * color;
}

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(
        c, -s,
        s, c
    );
}

vec4 permute(vec4 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

float lcg(inout float seed) {
    seed = fract(seed * 43758.5453123 + 12345.6789);
    return seed;
}

float randRange(inout float seed, float minVal, float maxVal) {
    return mix(minVal, maxVal, lcg(seed));
}

int randIntRange(inout float seed, int minInclusive, int maxInclusive) {
    float r = lcg(seed);
    int range = maxInclusive - minInclusive + 1;
    return minInclusive + int(floor(r * float(range)));
}

vec3 ToRainbow(vec2 uv) {
    vec2 uv2 = uv * 2.0 - 1.0;
    uv2.y *= -1.0;
    uv2 *= screen_size / 1000.0;
    float rainbow_color = 1.0 * (uv2.x + uv2.y);
    rainbow_color += time * 0.1;

    return ToRainbow(uv, rainbow_color);
}

vec3 ColorScramble(vec2 uv) {
    vec3 color = ToRainbow(uv);

    float gridSize = 10.0;
    float onGridSize = 5.0;
    float onPercent = 0.2;

    vec2 coord = uv * screen_size / gridSize;
    vec2 idx = floor(coord);
    vec2 off = fract(coord);

    float noiseCorse = cnoise(1.0 / onGridSize * vec3(idx, 10.0 * time));
    // float noise = cnoise(1.0 * vec3(idx, time));
    float seed = fract(floor(time * 10.0) / 10.0);
    lcg(seed);
    lcg(seed);
    vec2 roff = vec2(cnoise(1.0 * vec3(idx + vec2(randRange(seed, -1000.0, 1000.0), randRange(seed, -1000.0, 1000.0)), 0.0)), cnoise(1.0 * vec3(idx + vec2(randRange(seed, -1000.0, 1000.0), randRange(seed, -1000.0, 1000.0)), 0.0)));
    vec2 goff = vec2(cnoise(1.0 * vec3(idx + vec2(randRange(seed, -1000.0, 1000.0), randRange(seed, -1000.0, 1000.0)), 0.0)), cnoise(1.0 * vec3(idx + vec2(randRange(seed, -1000.0, 1000.0), randRange(seed, -1000.0, 1000.0)), 0.0)));
    vec2 boff = vec2(cnoise(1.0 * vec3(idx + vec2(randRange(seed, -1000.0, 1000.0), randRange(seed, -1000.0, 1000.0)), 0.0)), cnoise(1.0 * vec3(idx + vec2(randRange(seed, -1000.0, 1000.0), randRange(seed, -1000.0, 1000.0)), 0.0)));

    if (clamp(1.0 / (2.0 * onPercent) * (noiseCorse - 1.0) + 1.0, 0.0, 1.0) == 0.0) {
    // if( uv.x < 0.5) {
        roff = vec2(0.0);
        goff = vec2(0.0);
        boff = vec2(0.0);
    }

    color.r = ToRainbow((idx + 2.0 * roff + off) / screen_size * gridSize).r;
    color.g = ToRainbow((idx + 2.0 * goff + off) / screen_size * gridSize).g;
    color.b = ToRainbow((idx + 2.0 * boff + off) / screen_size * gridSize).b;

    return color;
}

void main() {
    vec2 tc = v_texcoord;

    vec2 center = abs(tc - 0.5);
    tc -= 0.5;
    tc *= 1.0 + (center * center).yx * vec2(0.25, 0.25);
    tc += 0.5;

    float scanline = sin(tc.y * 1200.0) * 0.02;

    if (tc.y > 1.0 || tc.x < 0.0 || tc.x > 1.0 || tc.y < 0.0) {
        fragColor = vec4(0.0);
        return;
    }

    float noise = cnoise(vec3(v_texcoord * screen_size / 1.0, time));
    // float n = 0.5;
    float n = noise;
    float y = tc.y;
    float a = time * 0.35;
    float x = y - a;
    float seed = fract(1000.0 * float(int(0.25 * time)));
    lcg(seed);
    lcg(seed);
    lcg(seed);
    lcg(seed);
    lcg(seed);
    for (int i = 0; i < 10; i++) {
        float c = randRange(seed, float(i * i) * 2.0, float(i * i) * 2.0 + float(i) * 20.0 + 1.0);
        float r = randRange(seed, 0.0, M_PI);
        n *= sin(c * x + r);
    }
    n *= 3.0;
    n = clamp(n, 0.0, 1.0);
    float color = floor(randRange(seed, 0.0, 1.0) + 0.5);
    fragColor.rgb = mix(ColorScramble(tc), vec3(color), n);

    seed = time;
    seed *= v_texcoord.y;
    seed += v_texcoord.y;
    lcg(seed);
    fragColor.rgb += scanline * pow(randRange(seed, 0.5, 2.0), 2.0);
}
