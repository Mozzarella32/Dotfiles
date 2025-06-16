#version 320 es

precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

out vec4 fragColor;

uniform float time;

#define M_PI 3.1415926535897932384626433832795

#define ReplaceThreshold 0.10

#define ReplaceColor 1.0,0.0,1.0
// #define ReplaceColor 0.192,0.231,0.678
// #define ReplaceColor 0.0,1.0,0.1

vec3 ReadPix(vec2 uv) {
    if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
        return vec3(ReplaceColor);
    }
    return texture(tex, uv).rgb;
}

float isRainbow(vec2 uv) {

    // ivec2 texsize = textureSize(tex,0);
    // vec2 texelsize = vec2(1.0)/vec2(texsize.x,texsize.y);

    float Rainbow = 0.0;

    // for(int x = -1; x <= 1; x++){
    //     for(int y = -1; y <= 1; y++){
    //         vec3 color = texture(tex,uv+vec2(x,0)*texelsize.x+vec2(0,y)*texelsize.y).rgb;
    //         Rainbow = max(float(int(abs(length(color-vec3(ReplaceColor))) < ReplaceThreshold)),Rainbow);
    //     }
    // }
    vec3 color = ReadPix(uv);
    // Rainbow = min(float(int(abs(length(color-vec3(ReplaceColor))) < (3.0*ReplaceThreshold))),Rainbow);
    Rainbow = float(int(abs(length(color - vec3(ReplaceColor))) < (3.0 * ReplaceThreshold)));
    return Rainbow;
}

vec3 GetRainbow(float time) {
    return vec3((sin(time) + 1.0) / 2.0, (sin(time + 2.0 * M_PI / 3.0) + 1.0) / 2.0, (sin(time + 4.0 * M_PI / 3.0) + 1.0) / 2.0);
}

vec3 GetRainbow(vec2 uv) {
    float off = (uv.x + uv.y) * 6.7 + 2.2;
    return vec3((sin(off) + 1.0) / 2.0, (sin(off + 2.0 * M_PI / 3.0) + 1.0) / 2.0, (sin(off + 4.0 * M_PI / 3.0) + 1.0) / 2.0);
}

vec3 GetPixel(vec2 uv) {

    // float off = (uv.x+uv.y) * 6.7+2.2;

    float Rainbow = isRainbow(uv);

    // vec3 RainbowColor = vec3((sin(off)+1.0)/2.0,(sin(off+2.0*M_PI/3.0)+1.0)/2.0,(sin(off+4.0*M_PI/3.0)+1.0)/2.0);

    return Rainbow * GetRainbow(uv) + (1.0 - Rainbow) * ReadPix(uv);
}

vec3 Blur(vec2 uv) {
    ivec2 texsize = textureSize(tex, 0);
    vec2 texelsize = vec2(1.0) / vec2(texsize.x, texsize.y);

    vec3 Color = vec3(0);
    // Color += GetPixel(uv);
    for (int x = -2; x <= 2; x++) {
        for (int y = -2; y <= 2; y++) {
            Color += GetPixel(uv + texelsize * vec2(x, y));
        }
    }
    return Color / 27.0;
}

vec3 Edge(vec2 uv) {
    ivec2 texsize = textureSize(tex, 0);
    vec2 texelsize = vec2(1.0) / vec2(texsize.x, texsize.y);

    vec3 Color = vec3(0);
    // Color += GetPixel(uv);
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            Color += GetPixel(uv + texelsize * vec2(x, y));
        }
    }
    Color -= 9.0 * GetPixel(uv);
    return Color;
}

vec3 EdgeBlur(vec2 uv) {
    ivec2 texsize = textureSize(tex, 0);
    vec2 texelsize = vec2(1.0) / vec2(texsize.x, texsize.y);

    vec3 Color = vec3(0);
    // Color += GetPixel(uv);
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            Color += Blur(uv + texelsize * vec2(x, y));
        }
    }
    Color -= 9.0 * GetPixel(uv);
    return Color;
}

vec3 Neon(vec3 Color) {
    // float f = 0.4 / length(Color);
    // f *= f;
    // Color *= f;
    // return Color;
    //
    //
    vec3 boosted = pow(Color, vec3(3.0)) * 20.0;

    boosted = mix(boosted, vec3(1.0, 1.0, 1.0), 0.05);

    return boosted;
}

mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(
        c, -s,
        s, c
    );
}

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 perm(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float noise(vec3 p) {
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

float sdSegment(in vec2 p, in vec2 a, in vec2 b)
{
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

vec3 LiquidGlass(vec2 uv, vec3 Glass_Color) {
    float noise =
        noise(vec3(10.0 * v_texcoord, 0.1 * time));
    noise = clamp(noise, 0.5, 1.0) - 0.5;
    float Edge = 1.0 - 2.0 * noise;
    Edge = Edge * Edge;
    Edge = Edge * Edge;
    Edge = Edge * Edge;
    Edge = Edge * Edge;
    float DistordEdge = Edge;
    Edge = Edge * Edge;
    // Edge = Edge * Edge;

    // float a = time;

    // vec2 Light = vec2(cos(a), sin(a));

    float EdgeDistance = 0.0;

    vec3 Pix;

    if (noise != 0.0) {
        EdgeDistance = Edge;

        // DistordEdge = pow(DistordEdge, DistordEdge);
        DistordEdge = DistordEdge;

        vec2 gradient = vec2(dFdx(DistordEdge), dFdy(DistordEdge));
        // float gradLength = length(gradient);
        // float threshold = 0.05; // Beispielwert

        // if (gradLength > threshold) {
        //     gradient = normalize(gradient) * threshold;
        // }

        Pix = Blur(v_texcoord - 0.5 * gradient);
    }
    else {
        Pix = GetPixel(v_texcoord);
    }

    float colorPlus = mix(0.0, 0.4, noise != 0.0);

    // float Highlight = max(10.0*EdgeDistance * dot(Light, gradient),0.5*EdgeDistance);
    float Highlight = 0.7 * EdgeDistance;

    return Pix + colorPlus * Glass_Color + Highlight * Glass_Color;
}

vec2 NormalizedUV(vec2 uv) {
    uv -= 0.5;
    uv.y *= screen_size.y / screen_size.x;
    return uv;
}

float Spiral(vec2 uv) {
    return 10.0*(uv.x + uv.y) + time;
    // return 20.0 * length(uv) + 20.0 * atan(uv.x, uv.y) - 5.0 * time;
}

void main() {
    vec2 uv = NormalizedUV(v_texcoord);
    // fragColor = vec4(Normalv_texcoord,0.0,0.0);
    // fragColor = vec4(LiquidGlass(uv, GetRainbow(Spiral(uv))), 0.0);
    // fragColor = vec4(LiquidGlass(v_texcoord, GetRainbow(0.5 * time)), 0.0);
    // fragColor = vec4(LiquidGlass(v_texcoord, vec3(1.0, 1.0, 1.0)), 0.0);
    //
    fragColor = vec4(GetPixel(v_texcoord), 1.0);
    // fragColor = vec4(GetPixel(vec2(0.5)+(v_texcoord-vec2(0.5)) * rot(0.0*sin(1.0*time)*sqrt(length(v_texcoord-vec2(0.5))))),1.0);

    // fragColor = vec4(GetPixel(fract(3.0*v_texcoord)),0.0);
    // fragColor = vec4(Neon(GetPixel(v_texcoord)),0.0);
    // fragColor = vec4(Edge(v_texcoord),0.0);
    // fragColor = vec4(Blur(v_texcoord),0.0);
    // fragColor = vec4(Neon(Blur(v_texcoord)),0.0);
    // fragColor = vec4(Neon(EdgeBlur(v_texcoord)),0.0);
    // vec4 pixColor = texture2D(tex,v_texcoord);
    // vec2 uv = v_texcoord;
    // uv *= 2.0;
    // uv -= 1.0;
    // uv.y /= screen_size.x/screen_size.y;
    // fragColor = vec4(step(abs(length(50.0*uv)-25.0)-0.2,0.0),pixColor.rg,1.0);
    // return;

    // float f = pixColor.r + pixColor.g + pixColor.b;
    // f /= 3.0;
    // f *= 0.8;

    // fragColor = vec4(vec3(f),pixColor.a);
    // return;

    // vec3 other = vec3(length(pixColor.rgb));//gray

    // vec3 other = vec3(1.0)-pixColor.rgb;//invers

    // vec3 other = pixColor.rgb;//normal

    // vec3 other = texture2D(tex,v_texcoord + 0.0003*hash(uv)).rgb;

    // float sdf_weight = length(vec2(1.0)-abs(uv));
    // float off = (v_texcoord.x+v_texcoord.y) * 6.7+2.2;
    // float off = (v_texcoord.x+v_texcoord.y) * 3.0+2.2;
    // float off = (coord.x+coord.y) * 6.7+2.2;

    // float weight = 1.0 - sdf_weight;

    // float weight = max(abs(uv).x, abs(uv).y);

    // float weight = 0.0;

    // vec3 dx = dFdx(pixColor.rgb);
    // vec3 dy = dFdy(pixColor.rgb);
    // vec3 other = dx+dy;

    // weight *= 0.6;

    // weight = 1.0 - weight;
    // weight = weight * weight;
    // weight = weight * weight;
    // weight = weight * weight;
    // weight = 1.0 - weight;

    // weight c*= 2.5;
    // float Rainbow = isRainbow(v_texcoord);

    // vec3 RainbowColor = vec3((sin(off)+1.0)/2.0,(sin(off+2.0*M_PI/3.0)+1.0)/2.0,(sin(off+4.0*M_PI/3.0)+1.0)/2.0);

    //isRainbow = float(int(false));

    // Rainbow *= 0.8;

    // fragColor = vec4(Rainbow * RainbowColor  + (1.0 - Rainbow) * (
    // pixColor.rgb * (1.0 - weight) + weight * texture2D(tex,v_texcoord).rgb
    // ),1.0);

    // fragColor = vec4(RotateColor(pixColor.rgb,weight),1.0);

    // fragColor = vec4(weight*other+ (1.0- weight)*pixColor.rgb,1.0);

    // float weight = 0.1;

    // gl_FragColor = vec4(gl_PrimitiveID/100.0, pixelColor.bga);

    // gl_FragColor = vec4(v_texcoord,0.0,1.0) * weight +  pixColor.gbra * (1.0 - weight);

    // if(pixColor.rgb == vec3(1.0)){
    // gl_FragColor = pixColor;
    // return;
    // }

    // gl_FragColor = vec4(1.0) - pixColor;
}
