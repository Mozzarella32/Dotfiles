#version 320 es

precision highp float;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

uniform int pointer_shape;

out vec4 fragColor;

uniform float time;

uniform vec2 pointer_position;

uniform float pointer_pressed_time;
uniform vec2 pointer_pressed_position;

#define M_PI           3.1415926535897932384626433832795
#define ONE_DIV_SQRT_2 0.7071067811865475244008443621048

#define ReplaceThreshold 0.10

#define ReplaceColor 1.0,0.0,1.0
// #define ReplaceColor 0.192,0.231,0.678
// #define ReplaceColor 0.0,1.0,0.1

vec2 NormalizedUV(vec2 uv) {
    // uv -= 0.5;
    // uv.y *= screen_size.y / screen_size.x;
    // return uv;
    return uv * screen_size;
}

// returnes vecdist x y, d
vec3 DistortClick(vec2 vec) {
    vec2 diff = NormalizedUV(vec) - NormalizedUV(pointer_pressed_position);
    float dist = 1.0;
    int max = 2;
    for(int i = 0; i < max; i++) {
        float d = 0.2 / float(i) * length(diff) - 15.0 * pointer_pressed_time + 2.0 * float(max - i);
        d = 1.0 - 0.01 /  exp(d * d) * float(i);
        dist = min(dist, d); 
    }
    return  vec3(dist * (vec - pointer_pressed_position) + pointer_pressed_position, dist);   
}

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

// vec3 GetRainbow(vec2 uv) {
//     float off = (uv.x + uv.y) * 6.7 + 2.2;
//     return vec3((sin(off) + 1.0) / 2.0, (sin(off + 2.0 * M_PI / 3.0) + 1.0) / 2.0, (sin(off + 4.0 * M_PI / 3.0) + 1.0) / 2.0);
// }

// vec3 GetPixel(vec2 uv) {

//     // float off = (uv.x+uv.y) * 6.7+2.2;

//     float Rainbow = isRainbow(uv);

//     // vec3 RainbowColor = vec3((sin(off)+1.0)/2.0,(sin(off+2.0*M_PI/3.0)+1.0)/2.0,(sin(off+4.0*M_PI/3.0)+1.0)/2.0);

//     return Rainbow * GetRainbow(uv) + (1.0 - Rainbow) * ReadPix(uv);
// }

vec3 ReadPixBilinear(vec2 uv) {
    vec2 texSize = vec2(textureSize(tex, 0));
    vec2 pixelPos = uv * texSize - 0.5;

    vec2 iPos = floor(pixelPos);
    vec2 fPos = fract(pixelPos);

    vec2 uv00 = (iPos + vec2(0.0, 0.0)) / texSize;
    vec2 uv10 = (iPos + vec2(1.0, 0.0)) / texSize;
    vec2 uv01 = (iPos + vec2(0.0, 1.0)) / texSize;
    vec2 uv11 = (iPos + vec2(1.0, 1.0)) / texSize;

    vec3 c00 = texture(tex, uv00).rgb;
    vec3 c10 = texture(tex, uv10).rgb;
    vec3 c01 = texture(tex, uv01).rgb;
    vec3 c11 = texture(tex, uv11).rgb;

    vec3 cx0 = mix(c00, c10, fPos.x);
    vec3 cx1 = mix(c01, c11, fPos.x);
    vec3 cxy = mix(cx0, cx1, fPos.y);

    return cxy;
}

vec3 GetRainbow(vec2 uv) {
    float off = (uv.x + uv.y) * 6.7 + 2.2;
    return vec3(
        (sin(off) + 1.0) / 2.0,
        (sin(off + 2.0 * M_PI / 3.0) + 1.0) / 2.0,
        (sin(off + 4.0 * M_PI / 3.0) + 1.0) / 2.0
    );
}

vec3 GetPixelBilinear(vec2 uv) {
    vec3 distd = DistortClick(uv);
    uv = distd.xy;
    float Rainbow = isRainbow(uv);
    return Rainbow * GetRainbow(uv) + (1.0 - Rainbow) * ReadPixBilinear(uv);
}

vec3 GetPixel(vec2 uv) {
    // return GetPixelBilinear(uv);
    vec3 distd = DistortClick(uv);
    uv = distd.xy;
    float Rainbow = isRainbow(uv);
    vec3 col = Rainbow * GetRainbow(uv) + (1.0 - Rainbow) * texture(tex,uv).rgb;
    float d = 1.0 / length(col);
    d *= d;
    d *= d;
    d *= d;
    // col = mix(d * col,col, min());
    return col;
}

vec3 Blur(vec2 uv) {
    ivec2 texsize = textureSize(tex, 0);
    vec2 texelsize = vec2(1.0) / vec2(texsize.x, texsize.y);

    vec3 Color = vec3(0);
    // Color += GetPixel(uv);
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            Color += GetPixel(uv + texelsize * vec2(x, y));
        }
    }
    return Color / 8.0;
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

mat2 rot90() {
    return mat2(
        0, -1,
        1, 0
    );
}

mat2 rot45() {
    return mat2(
        ONE_DIV_SQRT_2, -ONE_DIV_SQRT_2,
        ONE_DIV_SQRT_2, ONE_DIV_SQRT_2
    );
}

mat2 rot180() {
    return mat2(
        -1, 1,
        -1, -1
    );
}

vec2 flipx(vec2 v) {
    return vec2(- v.x, v.y);
}

vec2 flipy(vec2 v) {
    return vec2(v.x, -v.y);
}

float rad(float deg){
    return deg * M_PI / 180.0;
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

float Spiral(vec2 uv) {
    return 10.0 * (uv.x + uv.y) + time;
    // return 20.0 * length(uv) + 20.0 * atan(uv.x, uv.y) - 5.0 * time;
}


// The MIT License
// Copyright © 2015 Inigo Quilez
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Signed distance to a 2D cross. Produces exact exterior and
// bound interior distance. I need to fix the interior distance.

// List of some other 2D distances: https://www.shadertoy.com/playlist/MXdSRf
//
// and iquilezles.org/articles/distfunctions2d


float sdCross( in vec2 p, in vec2 b, float r ) {
    p = abs(p); p = (p.y>p.x) ? p.yx : p.xy;
    vec2  q = p - b;
    float k = max(q.y,q.x);
    vec2  w = (k>0.0) ? q : vec2(b.y-p.x,-k);
    return sign(k)*length(max(w,0.0)) + r;
}

float sdRoundedX( in vec2 p, in float w, in float r ) {
    p = abs(p);
    return length(p-min(p.x+p.y,w)*0.5) - r;
}

float sdBox( in vec2 p, in vec2 b ) {
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float dot2(vec2 v){
    return dot(v, v);
}

float sdfCoolS( in vec2 p ) {
    float six = (p.y<0.0) ? -p.x : p.x;
    p.x = abs(p.x);
    p.y = abs(p.y) - 0.2;
    float rex = p.x - min(round(p.x/0.4),0.4);
    float aby = abs(p.y-0.2)-0.6;
    
    float d = dot2(vec2(six,-p.y)-clamp(0.5*(six-p.y),0.0,0.2));
    d = min(d,dot2(vec2(p.x,-aby)-clamp(0.5*(p.x-aby),0.0,0.4)));
    d = min(d,dot2(vec2(rex,p.y  -clamp(p.y          ,0.0,0.4))));
    
    float s = 2.0*p.x + aby + abs(aby+0.4) - 0.4;
    return sqrt(d) * sign(s);
}

float sdEquilateralTriangle( in vec2 p, in float r ) {
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0*r, 0.0 );
    return -length(p)*sign(p.y);
}


float sdArc( in vec2 p, in vec2 sc, in float ra, float rb ) {
    // sc is the sin/cos of the arc's aperture
    p.x = abs(p.x);
    return ((sc.y*p.x>sc.x*p.y) ? length(p-sc*ra) : 
                                  abs(length(p)-ra)) - rb;
}
// Credit to Inigo Quilez for making all these wonderfull sdfs obove

float sdSub(float pos, float neg) {
    return max(pos, -neg);
}


float smooth_union(float sd1, float sd2, float k) {
    float h = clamp(0.5 + 0.5 * (sd2 - sd1) / k, 0.0, 1.0);
    return mix(sd2, sd1, h) - k * h * (1.0 - h);
}

float sdUnion(float sd1, float sd2) {
    return smooth_union(sd1, sd2, 0.1);
    // return min(sd1, sd2);
}

// float sdfXor(float sd1, float sd2) {
//     return sdfUnion(sdfSub(sd1, sd2), sdfSub(sd2, sd1));
// }

float sdText(vec2 diff) {
    return 
    sdUnion(
        sdBox(diff, vec2(2,10)),
        sdUnion(
            sdUnion(
                sdBox(diff + vec2(6, 12),  vec2(4, 2)),
                sdBox(diff + vec2(6, -12), vec2(4, 2))
            ),
            sdUnion(
                sdBox(diff + vec2(-6, 12),  vec2(4, 2)),
                sdBox(diff + vec2(-6, -12), vec2(4, 2))
            )
        )
    ) - 0.5;
}

float sdVertical_text(vec2 diff) {
    return sdText(diff * rot90());
}

float sdArrow(vec2 diff) {
    return
    sdUnion(
        sdBox(diff - vec2(0, 0), vec2(2, 8)),
        sdEquilateralTriangle(flipy(diff) - vec2(0, 10), 5.0)
    );
}

float sdnw_resize(vec2 diff) {
    return
    sdUnion(
        sdArrow((diff - vec2(16)) * rot45()),
        sdUnion(
            sdBox(diff + vec2(-6, 0), vec2(8, 2)),
            sdBox(diff + vec2(0, -6), vec2(2, 8))
        )
    ) - 0.5;
}

float sdsw_resize(vec2 diff) {
    return sdnw_resize(diff * rot90()); 
}

float sdse_resize(vec2 diff) {
    return sdsw_resize(diff * rot90()); 
}


float sdne_resize(vec2 diff) {
    return sdse_resize(diff * rot90()); 
}

float sdn_resize(vec2 diff) {
    return
    sdUnion(
        sdArrow(diff - vec2(0, 20)),
        sdBox(diff, vec2(10, 2))
    ) - 0.5;
}

float sds_resize(vec2 diff) {
    return sdn_resize(flipy(diff));
}

float sde_resize(vec2 diff) {
    return sds_resize(diff * rot90());
}

float sdw_resize(vec2 diff) {
    return sdn_resize(diff * rot90());
}

float sdrow_resize(vec2 diff) {
    return
    sdUnion(
      sdArrow(diff),  
      sdArrow(flipy(diff))  
    ) - 0.5;
}

float sdcol_resize(vec2 diff) {
    return sdrow_resize(diff * rot90());
}

float sdall_resize(vec2 diff) {
    return
    sdUnion(
        sdrow_resize(diff),  
        sdcol_resize(diff)  
    );
}

float sdnesw_resize(vec2 diff) {
    return sdcol_resize(diff * rot45());
}

float sdnwse_resize(vec2 diff) {
    return sdrow_resize(diff * rot45());
}

float sdCell(vec2 diff) {
    return sdCross(diff, vec2(14, 2), 0.0) - 0.5;
}

float sdCrossHair(vec2 diff) {
    return
    sdUnion(
        sdSub(
            sdCross(diff, vec2(14, 2), 0.0),
            sdBox(diff, vec2(5))),
        sdBox(diff, vec2(2))
    ) - 0.5;
}

float sdPointer(vec2 diff) {
    return length(diff) - 10.0;
}

float sdNotAllowed(vec2 diff) {
    return
    sdUnion(
        abs(length(diff) - 15.0) - 2.0,
        sdRoundedX(diff, 12.0, 0.0) - 2.0
    );
}


float sdContext_menu(vec2 diff) {
    return
    sdUnion(
        abs(length(diff) - 15.0) - 2.0,
        sdUnion(
            sdBox(diff + vec2(0, 8), vec2(2)),
            sdBox(diff - vec2(0, 4), vec2(2,6))
        )
    ) - 0.5;
}

float sdMagnification_glass(vec2 diff){
    return
    sdUnion(
        abs(length(diff) - 13.0) - 1.0,
        sdBox(diff * rot(rad(-135.0)) + vec2(0,20) , vec2(1,6))
    );
}

float sdZoom_in(vec2 diff) {
    return
    sdUnion(
        sdMagnification_glass(diff),
        sdUnion(
            sdBox(diff, vec2(1,6)),    
            sdBox(diff, vec2(6,1))    
        )
    ) - 0.5;
}

float sdZoom_out(vec2 diff) {
    return
    sdUnion(
        sdMagnification_glass(diff),
        sdBox(diff, vec2(6,1))    
    ) - 0.5;
}

float sdWait(vec2 diff) {
    // return abs(sdfCoolS(diff)) - 2.0;
    return abs(sdfCoolS(diff / 20.0) * 20.0) - 2.0;

}

vec2 apeture(float a) {
    return vec2(sin(a), cos(a));
}

float sdHelp(vec2 diff) {
    return sdArc(diff * rot(2.0*M_PI/3.0), apeture(M_PI / 1.5), 0.7, 0.1);
}

float CursorSDF(vec2 uv, vec2 uv_pointer) {

    vec2 diff = uv - uv_pointer;

    // diff -= vec2(50, 0);

      switch (pointer_shape){
        case 0: //invalid
            return length(diff) - 20.0;
        // case 1: //default
        //     return length(diff) - 20.0;
        case 2: //context-menu
            return sdContext_menu(diff);
        case 3: //help
            return sdHelp(diff);
            // return 2.0;
        case 4: //pointer
            return sdPointer(diff);
        case 5 : //progress
            return sdWait(diff);
        case 6: //wait
            return sdWait(diff);
        case 7: //cell
            return sdCell(diff);
        case 8: //crosshair
            return sdCrossHair(diff);
        case 9: //text
            return sdText(diff);
        case 10: //vertical-text
            return sdVertical_text(diff);
        // case 11: //alias
        //     return length(diff) - 10.0;
        // case 12: //copy
        //     return length(diff) - 10.0;
        case 13: //move
            return sdall_resize(diff);
        // case 14: //no-drop
        //     return length(diff) - 10.0;
        case 15: //not-allowed
            return sdNotAllowed(diff);
        // case 16: //grab
        //     return length(diff) - 10.0;
        // case 17: //grabbing
        //     return length(diff) - 10.0;
        case 18: //e-resize
            return sde_resize(diff);
        case 19: //n-resize
            return sdn_resize(diff);
        case 20: //ne-resize
            return sdne_resize(diff);
        case 21: //nw-resize
            return sdnw_resize(diff);
        case 22: //s-resize
            return sds_resize(diff);
        case 23: //se-resize
            return sdse_resize(diff);
        case 24: //sw-resize
            return sdsw_resize(diff);
        case 25: //w-resize
            return sdw_resize(diff);
        case 26: //ew-resize
            return sdcol_resize(diff);
        case 27: //ns-resize
            return sdrow_resize(diff);
        case 28: //nesw-resize
            return sdnesw_resize(diff);
        case 29: //nwse-resize
            return sdnwse_resize(diff);
        case 30: //col-resize
            return sdcol_resize(diff);
        case 31: //row-resize
            return sdrow_resize(diff);
        case 32: //all-scroll
            return sdall_resize(diff);
        case 33: //zoom-in
            return sdZoom_in(diff);
        case 34: //zoom-out
            return sdZoom_out(diff);
        // case 35: //dnd-ask
        //     return length(diff) - 10.0;
        // case 36: //all-resize
        //     return length(diff) - 10.0;
        // case 37: //left_ptr
        //     return length(diff) - 10.0;
        case 38: //top_side 
            return sdn_resize(diff);
        case 39: //bottom_side
            return sds_resize(diff);
        case 40: //left_side
            return sdw_resize(diff);
        case 41: //right_side
            return sde_resize(diff);
        case 42: //top_left
            return sdnw_resize(diff);
        case 43: //bottom_left_corner
            return sdsw_resize(diff);
        case 44: //top_right_corner
            return sdne_resize(diff);
        case 45: //bottom_right_corner
            return sdse_resize(diff);
        // case 46: // ""
        //     return length(diff) - 10.0;
        case 47: // hidden
            return 10.0;
        default:
            return length(diff) - 10.0;
    }
}

float Cursor(){
    // vec2 uv = NormalizedUV(DistortClick(v_texcoord));
    vec2 uv = NormalizedUV(v_texcoord);

    vec2 uv_pointer = NormalizedUV(pointer_position);
    // vec2 uv_click   =  NormalizedUV(pointer_pressed_position);

    // uv = round(uv);
    // uv_pointer = round((uv_pointer + vec2(0.5)) / 2.0) * 2.0;

    // uv /= 6.0;
    // uv_pointer /= 6.0;

    // uv -= uv_pointer;

    // float num = 16.0;

    // uv = 1.0/num*fract(num*uv);
    // uv_pointer = 1.0/num*fract(num*uv_pointer);


    // uv += uv_pointer;

    // uv -= vec2(1.0/num) / 2.0;

    // float d = CursorSDF(uv, uv_pointer + vec2(0.02,0.0));
    float d = CursorSDF(uv, uv_pointer);
    // d = sdUnion(d, CursorSDF(uv, uv_click) / pointer_pressed_time);
    // float d = 1.0;

    int max = 6*4 * 8;

    // for(int i = 0; i < max; i++) {
    //     float angle = (-0.5*time + 2.0 * float(i) / float(max)) * M_PI * 2.0;
    //     d = sdUnion(
    //         d,
    //         CursorSDF(uv,uv_pointer + (2.0 * float(i)) * vec2(cos(angle), sin(angle)))
    //     );
    // }

    return d;
}

vec3 LiquidGlass(vec2 uv, vec3 Glass_Color) {
    // float noise =
        // noise(vec3(10.0 * v_texcoord, 2.0 * time));

    // return vec3(noise);

    float noise = Cursor();
    // return vec3(noise);

    // return vec3(noise);

    // noise -= 0.5;
    
    float noiseclamp = 1.0 / (1.0 + exp(-noise));
    float Edge = noiseclamp;
    Edge = 1.0 - Edge;
    // Edge *= Edge;
    // Edge *= Edge;
    // Edge *= Edge;
    // Edge = 1.0 - Edge;
    float DistordEdge = Edge;

    // Edge = noiseclamp;
    // return vec3(Edge);

    // return vec3(DistordEdge / time);

    // return vec3(Edge);
    // Edge = abs(noise);
    // Edge = 1.0 - Edge;
    // Edge *= Edge;
    // Edge *= Edge;
    // Edge *= Edge;
    // Edge = 1.0 - Edge;

    // Edge = - Edge;



    vec3 Pix;


    float colorPlus = 0.0;
    float highlight = 0.0;
    vec2 gradient = vec2(dFdx(DistordEdge), dFdy(DistordEdge));
    // return vec3(100.0*gradient,0.0);
    //

    vec3 colorIn;
    vec3 colorOut = GetPixel(uv);

    if (noise <= 20.0) {
        Pix = Blur(uv - 00.0 * gradient);
        // Pix = GetPixel(uv - 00.0 * gradient);
        highlight = noiseclamp;
        highlight *= highlight;
        highlight *= highlight;
        highlight *= 10.0;
        colorIn = mix(mix(Pix, Glass_Color, 0.4), Glass_Color, highlight);
    }

    // float Highlight = max(10.0*EdgeDistance * dot(Light, grabc2e497ce4dd964e59bef81562ec2dient),0.5*EdgeDistance);

    // return vec3(highlight);

    // return vec3(clamp(0.0, 1.0, noise));

    return mix(colorOut, colorIn, clamp(3.0*(1.0-noiseclamp), 0.0, 1.0));
}

void main() {
        
    fragColor = vec4(LiquidGlass(v_texcoord, GetRainbow(v_texcoord)), 1.0);
    // vec3 col = LiquidGlass(v_texcoord, GetRainbow(v_texcoord));

    // return;
    // vec2 uv = NormalizedUV(v_texcoord);

    // fragColor = vec4(uv / screen_size, 0.0,1.0);

    // return;

 //    float d = Cursor() - abs(2.0*sin(3.0*time));


 //    vec3 col = (d>0.0) ? vec3(0.9,0.6,0.3) : vec3(0.65,0.85,1.0);
	// col *= 1.0 - exp(-6.0*abs(d));
	// col *= 0.8 + 0.2*cos(0.5*d);
	// col = mix( col, vec3(1.0), 1.0-smoothstep(0.0,0.01,abs(d)) );

    // fragColor = vec4(col, 1.0);

    // fragColor = vec4(mix(col,GetPixel(v_texcoord),0.25), 1.0);
    // d = 1.0 - 100.0 * d;
    // d = 1.0 - d;
    // // d *= d;
    // // d *= d;
    // // d *= d;
    // // d *= d;
    // d = 1.0 - d;
    // // d = clamp(d, 0.0, 1.0);

    // // if(d > -0.5 && d < 0.0){
    // //     fragColor = vec4(0.0);
    // //     return;
    // // }

    // d = clamp(d, 0.0, 1.0);
    // d = 1.0 - d;
    
    // fragColor = vec4(mix(GetPixel(v_texcoord), GetRainbow(v_texcoord), d), 1.0);

    // float a = float(cursor_shape) / 35.0;
    
    // fragColor = vec4(mix(GetPixel(v_texcoord), vec3(a), 0.5), 1.0);

    // float d = 1.0*length(uv - uv_pointer);

    // d = 1.0 - d;
    // d += 0.1;

    // d *= d;
    // d *= d;
    // d *= d;

    // fragColor = vec4(mix(GetPixel(v_texcoord), GetRainbow(v_texcoord), d), 1.0);




    // d = d * d;
    // d = d * d;
    // // d = d * d;
    // // d = d * d;
    // // d = d * d;
    // // d = d * d;
    // // d = d * d;

    // d = 1.0 - d;

    // fragColor = vec4(vec3(d),1.0);
    // fragColor = vec4(GetPixel( ((v_texcoord-pointer_position)*d + pointer_position - vec2(0.5)) * rot(length(v_texcoord) + time) + vec2(0.5)),1.0);

    // fragColor = vec4(mix(GetPixel(v_texcoord), vec3(1.0,0.0,0.0), step(0.5,pow(1.0-length(v_texcoord-pointer_position),100.0))), 1.0);
    // fragColor = vec4(LiquidGlass(uv, GetRainbow(Spiral(uv))), 0.0);
    // fragColor = vec4(LiquidGlass(v_texcoord, GetRainbow(0.5 * time)), 0.0);
    // fragColor = vec4(LiquidGlass(v_texcoord, vec3(1.0, 1.0, 1.0)), 0.0);

    // fracColor = texture(tex, uv);
    // fragColor = vec4(GetPixel(v_texcoord), 1.0);
    // fragColor = vec4(GetPixel(vec2(0.5)+(v_texcoord-vec2(0.5)) * rot(0.0*sin(1.0*time)*sqrt(length(v_texcoord-vec2(0.5))))),1.0);

    // fragColor = vec4(GetPixel(frart(3.0*v_texcoord)),0.0);
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
