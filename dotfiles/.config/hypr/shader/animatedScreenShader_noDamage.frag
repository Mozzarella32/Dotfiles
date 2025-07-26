#version 320 es

precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

uniform float time;

out vec4 fragColor;

#define M_PI 3.1415926535897932384626433832795

#define ReplaceThreshold 0.3

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

// void main() {
//     vec4 pixColor = texture2D(tex,v_texcoord);

//     // vec3 other = vec3(length(pixColor.rgb));//gray

//     vec3 other = vec3(1.0)-pixColor.rgb;//invers

//     // vec3 other = pixColor.rgb;//normal

//     vec2 uv = v_texcoord * 2.0 - 1.0;

//     // vec3 other = texture2D(tex,v_texcoord + 0.0003*hash(uv)).rgb;

//     float sdf_weight = length(vec2(1.0)-abs(uv));
//     float off = (v_texcoord.x+v_texcoord.y) * 6.7+2.2;
//     // float off = (coord.x+coord.y) * 6.7+2.2;
    
//     // float weight = 1.0 - sdf_weight;

//     // float weight = max(abs(uv).x, abs(uv).y);

//     float weight = 0.0;

//     // vec3 dx = dFdx(pixColor.rgb);
//     // vec3 dy = dFdy(pixColor.rgb);
//     // vec3 other = dx+dy;

//     // weight *= 0.6;

//     // weight = 1.0 - weight;
//     weight = weight * weight;
//     weight = weight * weight;
//     weight = weight * weight;
//     // weight = 1.0 - weight;

//     // weight c*= 2.5;
//     float isRainbow = float(int(abs(length(pixColor.rgb-vec3(1.0,0.0,1.0))) < 0.100));

//     off += 0.10 * time;

//     vec3 Rainbow = vec3((sin(off)+1.0)/2.0,(sin(off+2.0*M_PI/3.0)+1.0)/2.0,(sin(off+4.0*M_PI/3.0)+1.0)/2.0);

//     //isRainbow = float(int(false));

//     // Rainbow *= 0.8;

//     fragColor = vec4(isRainbow * Rainbow  + (1.0 - isRainbow) * (
//     pixColor.rgb * (1.0 - weight) + weight * other
//     ),1.0);

//     // fragColor = vec4(RotateColor(pixColor.rgb,weight),1.0);

//     // fragColor = vec4(weight*other+ (1.0- weight)*pixColor.rgb,1.0); 

//     // float weight = 0.1;

//     // gl_FragColor = vec4(gl_PrimitiveID/100.0, pixelColor.bga); 
    
//     // gl_FragColor = vec4(v_texcoord,0.0,1.0) * weight +  pixColor.gbra * (1.0 - weight);

//     // if(pixColor.rgb == vec3(1.0)){
//         // gl_FragColor = pixColor;
//         // return;
//     // }

//     // gl_FragColor = vec4(1.0) - pixColor;
// }

int MaxIter = 10;


float isRainbow(vec2 uv){

    ivec2 texsize = textureSize(tex,0);
    vec2 texelsize = vec2(1.0)/vec2(texsize.x,texsize.y);

    float Rainbow = 0.0;

    for(int x = -1; x <= 1; x++){
        for(int y = -1; y <= 1; y++){
            vec3 color = texture(tex,uv+vec2(x,0)*texelsize.x+vec2(0,y)*texelsize.y).rgb;
            Rainbow = max(float(int(abs(length(color-vec3(1.0,0.0,1.0))) < ReplaceThreshold)),Rainbow);
        }
    }
    vec3 color = texture(tex,uv).rgb;
    Rainbow = min(float(int(abs(length(color-vec3(1.0,0.0,1.0))) < (3.0*ReplaceThreshold))),Rainbow);
    return Rainbow;
}

vec3 ToRainbow(vec2 uv, float off) {
    
    float isRainbow = isRainbow(uv);

    vec3 color = texture(tex,uv).rgb;
    
    vec3 Rainbow = vec3((sin(off)+1.0)/2.0,(sin(off+2.0*M_PI/3.0)+1.0)/2.0,(sin(off+4.0*M_PI/3.0)+1.0)/2.0);

    return isRainbow*Rainbow+(1.0-isRainbow)*color;
}

// vec3 DistortColor(vec3 color, float amount) {
//     // Konvertiere RGB nach XYZ für eine bessere Farbverteilung
//     mat3 rgbToXyz = mat3(
//         0.4124564, 0.3575761, 0.1804375,
//         0.2126729, 0.7151522, 0.0721750,
//         0.0193339, 0.1191920, 0.9503041
//     );
//     vec3 xyz = rgbToXyz * color;

//     // Verzerrung durch nichtlineare Modifikation
//     xyz = mix(xyz, xyz * (1.0 + amount * (sin(xyz * 3.1415) * 0.5 + 0.5)), 0.7);

//     // Zurückkonvertieren nach RGB
//     mat3 xyzToRgb = mat3(
//          3.2404542, -1.5371385, -0.4985314,
//         -0.9692660,  1.8760108,  0.0415560,
//          0.0556434, -0.2040259,  1.0572252
//     );
//     vec3 distortedColor = xyzToRgb * xyz;

//     // Clamping, um sicherzustellen, dass die Farben im gültigen Bereich bleiben
//     return clamp(distortedColor, 0.0, 1.0);
// }

void main(){

    vec2 uv = v_texcoord;

    uv = uv * 2.0 - 1.0;

    uv.y *= -1.0;

    uv *= screen_size / 1000.0;

    float off = 1.0*(uv.x+uv.y);

    // off *= 5.0;

    off += time*0.1;
#ifdef Use_Weight
    int iter = 0;
    
    vec2 C = uv;

    // fragColor = vec4(uv,0.0,1.0);

    // return;

    // vec2 C = vec2(sin(time),cos(time));

    // C *= 3.0;

    // C.x -= 0.7;

    vec2 Z = C;

    // float CTime = time *M_PI*2.0/3600.0;

    float CTime = time;

    C = vec2(sin(CTime),cos(CTime*0.26));

    // (a+bi)²+c+di
    // a²+2abi-b²+c+di
    // a²-b²+c +(2ab+d)i

    while(iter < MaxIter && Z.x*Z.x+Z.y*Z.y < 4.0){
        iter++;
        Z = vec2(Z.x*Z.x-Z.y*Z.y+C.x,2.0*Z.x*Z.y+C.y);
    }

    float weight = float(iter)/float(MaxIter);


    // vec3 other = vec3(length(pixColor.rgb));//gray

    // vec3 other = vec3(c);
        
    // vec3 other = vec3(1.0)-pixColor.rgb;//invers

    // vec3 other = RotateColor(pixColor.rgb,fract(time)*5.0);//HueRotate

    // fragColor = vec4(weight*other+(1.0-weight)*pixColor.rgb,1.0);
#endif

#ifdef Distored_Position
    vec2 distorted = (1.0+0.45*weight)*(v_texcoord - 0.5) + 0.5;
#else
    vec2 distorted = v_texcoord;
#endif
    
    // vec3 color = texture(tex,distorted).rgb;

    vec3 color = ToRainbow(distorted,off);

#ifdef Distored_Color
    color = DistortColor(color,weight*50.0);
#endif

    // color = RotateColor(vec3(1.0,0.0,1.0),2.0*weight);

    // color = vec3(weight);
    
    fragColor.rgb = color;
}
   
