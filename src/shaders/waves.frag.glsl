#version 300 es

precision mediump float;
in vec2 v_uv;
uniform float u_time;
out vec4 outColor;

void main() {
  vec2 st = v_uv;
  st.x *= 200.0;
  st.y *= 20.0;

  float a = (sin(st.x + u_time) + 1.0) * 0.5;

  outColor = vec4(1.0, 1.0, 1.0, 0.1);
}
