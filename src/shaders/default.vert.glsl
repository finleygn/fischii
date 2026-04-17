#version 300 es

in vec4 position;
uniform mat3x2 u_matrix;
out vec2 v_uv;

void main() {
  v_uv = position.xy;

  vec2 transformedPosition = u_matrix * vec3(position.xy, 1.0);
  gl_Position = vec4(transformedPosition, 0, 1);
}