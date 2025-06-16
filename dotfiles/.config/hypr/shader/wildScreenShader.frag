#version 320 es

precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

uniform float time;

// in int gl_PrimitiveID;
out vec4 fragColor;

#define M_PI 3.1415926535897932384626433832795

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

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

mat2 getRotation(float f){
    float s = sin(f);
    float c = cos(f);
    return mat2(c, -s, s, c);
}

vec3 MyRainbow = vec3(1.0,0.0,1.0);

void main() {
    float wtime = sin(4.0*time);
    float distort = 0.1*wtime/length(v_texcoord - 0.5);
    distort = distort*distort*sign(distort);
    vec2 coord = ((v_texcoord-0.5)* getRotation(distort))+0.5;
    // vec2 coord = (v_texcoord + fract(time) - 0.5) * getRotation(1.0) - fract(time) + 0.5;
    // vec2 coord = v_texcoord * getRotation(1.0);
    float shift = 0.5500*sin(6.0*time+coord.y*20.0+coord.x*20.0);
    // shift = 0.0;
    shift = shift*shift;
    shift = shift*shift;
    shift = shift*shift;
    // shift = shift*shift;
    //    shift = 1.0/shift;
    // coord.y += shift;
    coord.y += 2.0*shift;
    // coord.x += shift;

    // vec4 pixColor = vec4(coord,0.0,1.0);
    vec4 pixColor = texture2D(tex,coord);

    // vec4 pixColor = vec4(
    //     texture2D(tex,vec2(v_texcoord.x+0.0,v_texcoord.y+0.0)).r,
    //     texture2D(tex,vec2(v_texcoord.x+1.0/2000.0,v_texcoord.y+0.0)).g,
    //     texture2D(tex,vec2(v_texcoord.x+0.0,v_texcoord.y+1.0/1000.0)).b,
    //     1.0);

    // pixColor.b *= 0.6;

    // gl_FragColor = pixColor;

    // gl_FragColor = pixColor;

    // pixColor[2] *= 0.8;

    // float l = length(pixColor.rbg);
    //  l= l*l;
    //  l= l*l;
    //  l= l*l;
    //  l= l*l;
    //  l = 1.0-l;
     // vec3 other = l * pixColor.rgb;
     // gl_FragColor = pixColor.bgra;

    // vec3 other = vec3(length(pixColor.rgb));//gray

    vec3 other = vec3(1.0)-pixColor.gbr;//invers

    // vec3 other = pixColor.rgb;//normal

    // vec2 uv = v_texcoord * 2.0 - 1.0;

    // vec3 other = texture2D(tex,v_texcoord + 0.0003*hash(uv)).rgb;

    // float sdf_weight = length(vec2(1.0)-abs(uv));
    float off = (v_texcoord.x+v_texcoord.y+time*1.1) * 6.7+2.2;
    // float off = (coord.x+coord.y) * 6.7+2.2;
    
    // float weight = 1.0 - sdf_weight;

    // float weight = max(abs(uv).x, abs(uv).y);

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
    float weight = float(int(abs(length(pixColor.rgb-MyRainbow)) < 0.111));

    vec3 Rainbow = vec3((sin(off)+1.0)/2.0,(sin(off+2.0*M_PI/3.0)+1.0)/2.0,(sin(off+4.0*M_PI/3.0)+1.0)/2.0);

    Rainbow *= 0.9;

    fragColor = vec4(weight * Rainbow  + (1.0 - weight) * other,1.0);
    // fragColor = vec4(Rainbow.rg,pixColor.b,1.0);

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
