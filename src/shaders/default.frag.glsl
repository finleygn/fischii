#version 300 es

precision mediump float;
 
in vec2 v_uv;
out vec4 outColor;

void main() {
  outColor = vec4(v_uv.x, 1, 1, 1);
}