#version 320 es

precision mediump float;
in vec2 v_texcoord;
uniform sampler2D tex;
uniform vec2 screen_size;

uniform float time;

out vec4 fragColor;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    fragColor.rgb = vec3(rand(v_texcoord + vec2(time)));
}
