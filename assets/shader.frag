#version 330 core

out vec4 finalColor;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float seconds;

#define PI 3.14159265359


struct transducer {
    vec2 pos;
    float phase;
};

const float SIM_SPEED = 1e-5;
const float FREQ = 40e3;                // Hz
const float WAVE_SIM_SPEED = 343;       // m/s
const float SCALE = 10;                // 1 => screen = 2x2m   2 => screen = 4x4m
const float WAVE_LENGTH = WAVE_SIM_SPEED / FREQ;
const int NUM_OF_TRANSDUCERS = 70;
const float SPACING = 0.52 * WAVE_LENGTH;

float angle = 0.0;


float get_beam_angle(vec2 pos) {
  return -atan(pos.x/(pos.y+1));
}


transducer get_transducer(int index, float angle) {
  float i = float(index);
  vec2 pos = vec2(SPACING*(i - (NUM_OF_TRANSDUCERS-1)/2), -1);
  float phase = 2*PI / WAVE_LENGTH * i * SPACING * sin(angle);
  return transducer(pos, phase);
}


float wave_height(vec2 pos, float angle) {
  float height = 0.0;
  for (int i = 0; i < NUM_OF_TRANSDUCERS; i++) {
    transducer t = get_transducer(i, angle);
    float dis = length(pos - t.pos);
    float wave = 1/pow(dis, 2) * sin(2.0*PI*(FREQ*seconds*SIM_SPEED - dis/WAVE_LENGTH) + t.phase);
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

  float angle = get_beam_angle(mouse_uv);
  float height = wave_height(uv, angle);
  vec3 color = color_map(height);

  finalColor = vec4(color, 1.0);
}