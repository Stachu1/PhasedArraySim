#version 330 core

out vec4 finalColor;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float seconds;

#define PI 3.14159265359


struct transducer {
    vec2 pos;
    float ampl;
    float phase;
};

const float SPEED = 1e-5;
const float FREQ = 40e3;                // Hz
const float WAVE_SPEED = 343;           // m/s
const float SCALE = 0.5;                // 1 => screen = 2x2m   2 => screen = 4x4m
const float WAVE_LENGTH = WAVE_SPEED / FREQ;
const int NUM_OF_TRANSDUCERS = 5;


transducer t1 = transducer(vec2(-WAVE_LENGTH, -1.0), 0.5, 0.0);
transducer t2 = transducer(vec2(-0.5*WAVE_LENGTH, -1.0), 0.5, 0.0);
transducer t3 = transducer(vec2(0.0, -1.0), 0.5, 0.0);
transducer t4 = transducer(vec2(0.5*WAVE_LENGTH, -1.0), 0.5, 0.0);
transducer t5 = transducer(vec2(WAVE_LENGTH, -1.0), 0.5, 0.0);

transducer transducers[5] = transducer[5](t1, t2, t3, t4, t5);


float wave_height(vec2 pos) {
    float height = 0.0;
    for (int i = 0; i < NUM_OF_TRANSDUCERS; i++) {
        float dis = length(pos - transducers[i].pos);
        float wave = 1/pow(dis, 2) * transducers[i].ampl* sin(2.0*PI*(FREQ*seconds*SPEED - dis/WAVE_LENGTH) + transducers[i].phase);
        height += wave;
    }
    return height;
}


vec3 color_map(float value) {
  float r = (abs(-value)-value) * 0.5;
  float g = 0.0;
  float b = (value+abs(value)) * 0.5;
  return vec3(r, g, b);
}


// Main function
void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy - 1.0;
    vec2 mouse_uv = 2.0 * mouse.xy / resolution.xy - 1.0;
    mouse_uv.y *= -1;

    uv *= SCALE;
    uv -= vec2(0, 1-SCALE);

    float height = wave_height(uv);
    vec3 color = color_map(height);

    finalColor = vec4(color, 1.0);
}