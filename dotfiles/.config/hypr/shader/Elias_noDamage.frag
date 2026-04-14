#version 320 es

precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

uniform float time;

out vec4 fragColor;

#define M_PI 3.1415926535897932384626433832795

#define ReplaceThreshold 0.3
#define ReplaceColor 1.0,0.0,1.0

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

vec3 ToRainbow(vec2 uv) {
    vec2 uv2 = uv * 2.0 - 1.0;
    uv2.y *= -1.0;
    uv2 *= screen_size / 1000.0;
    float rainbow_color = 1.0 * (uv2.x + uv2.y);
    rainbow_color += time * 0.1;

    return ToRainbow(uv, rainbow_color);
}

vec3 sdfVis(float sdf) {
    vec3 col = (sdf > 0.0) ? vec3(0.9, 0.6, 0.3) : vec3(0.65, 0.85, 1.0);
    col *= 1.0 - exp2(-20.0 * abs(sdf));
    col *= 0.8 + 0.2 * cos(120.0 * abs(sdf));
    col = mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(sdf)));
    return col;
}

void main() {
    vec2 coord = v_texcoord;
    // coord -= 0.5;
    // coord *= vec2(1.045, 1.040);
    // coord += 0.5;

    vec3 pixel = ToRainbow(coord);
    vec3 color = vec3(0.0);

    coord.x -= 0.5;
    coord.x *= 2.0;

    color = sdfVis(length(coord - 0.5) - 0.5);

    if (v_texcoord.x > 0.5
            && false
    ) {
        fragColor.rgb = color;
    }
    else {
        fragColor.rgb = pixel;
    }
}
