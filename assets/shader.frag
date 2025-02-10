#version 330 core

out vec4 finalColor;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float seconds;

#define PI 3.14159265359


// Main function
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy - 1.0;
    vec2 mouse_uv = 2.0 * mouse.xy / resolution.xy - 1.0;
    mouse_uv.y *= -1;


    finalColor = vec4(vec3(uv.x,uv.y,uv.y), 1.0);
}