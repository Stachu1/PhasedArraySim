#version 330 core

out vec4 finalColor;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float seconds;

#define PI 3.14159265359


struct transducer {
    vec3 pos;
    float phase;
};

const float SIM_SPEED = 1e-5;
const float FREQ = 40e3;                // Hz
const float WAVE_SIM_SPEED = 343;       // m/s
const float SCALE = 0.5;                // 1 => screen = 2x2m   2 => screen = 4x4m
const float WAVE_LENGTH = WAVE_SIM_SPEED / FREQ;
const float AMPLITUDE = 0.01;
const int NUM_OF_TRANSDUCERS = 19;
const float DIAMETER = 0.010;



float get_beam_angle(vec2 pos) {
  return -atan(pos.x/(pos.y+1));
}


transducer get_transducer(int index, float angle) {
  float i = float(index);
  float x_offset = DIAMETER * (i - (NUM_OF_TRANSDUCERS - 1) * 0.5) * 0.5;
  float z_offset = DIAMETER * 0.4330127019;      // sqrt(3)/4
  if (index % 2 == 0) {
    z_offset *= -1;
  }
  vec3 pos = vec3(x_offset, -1, z_offset);
  float phase = PI / WAVE_LENGTH * i * DIAMETER * sin(angle);
  return transducer(pos, phase);
}


float wave_height(vec2 pos, float angle) {
  float height = 0.0;
  for (int i = 0; i < NUM_OF_TRANSDUCERS; i++) {
    transducer t = get_transducer(i, angle);
    float y_view = 0.0;
    float dis = length(vec3(pos, y_view) - t.pos);
    float wave = AMPLITUDE / pow(dis, 2) * sin(2.0*PI*(FREQ*seconds*SIM_SPEED - dis/WAVE_LENGTH) + t.phase);
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

  uv.x *= resolution.x / resolution.y;
  mouse_uv.x *= resolution.x / resolution.y;
  if (uv.x > 0) {
    uv -= vec2(1, 0);
    mouse_uv -= vec2(1, 0);

    uv *= SCALE;
    uv += vec2(0, SCALE-1);
    mouse_uv *= SCALE;
    mouse_uv += vec2(0, SCALE-1);

    float angle = 0.0;
    if (mouse_uv.x > -1 && mouse_uv.x < 1 && mouse_uv.y > -1 && mouse_uv.y < 1) {
      angle = get_beam_angle(mouse_uv);
    }
    float height = wave_height(uv, angle);
    vec3 color = color_map(height);
    finalColor = vec4(color, 1.0);
  }
  else {
    uv += vec2(1, 0);
    mouse_uv += vec2(1, 0);

    uv *= SCALE;
    mouse_uv *= SCALE;


    vec3 color = vec3(0, 0, 0);

    for (int i = 0; i < NUM_OF_TRANSDUCERS; i++) {
      transducer t = get_transducer(i, 0);
      float d = length(uv - t.pos.xz);
      if (d < DIAMETER*0.5) {
        float r = (float(i))/NUM_OF_TRANSDUCERS;
        color = vec3(r, 0, 1-r);
      }
    }

    finalColor = vec4(color, 1);
  }
}
