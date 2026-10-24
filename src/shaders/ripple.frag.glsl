#version 300 es

precision mediump float;
 
in vec2 v_uv;
uniform float u_progress;
out vec4 outColor;

float ring(
  vec2 uv,
  float localProgress,
  float baseThickness
) {
  if (localProgress <= 0.0 || localProgress >= 1.0) return 0.0;

  float radius = localProgress * 0.5;
  float dist = length(uv);

  float currentThickness = baseThickness;
  float diff = abs(dist - radius);

  float edgeSoftness = 0.03; 
  float ringShape = smoothstep(currentThickness + edgeSoftness, currentThickness, diff);
  float fade = smoothstep(1.0, 0.7, localProgress);

  return ringShape * fade;
}

void main() {
  vec2 st = (v_uv - 0.5);
  float mask = 0.0;

  mask += ring(st, u_progress, 0.025);

  float p2 = (u_progress - 0.4) / 0.6;
  mask += ring(st, p2, 0.02);

  float p3 = (u_progress - 0.6) / 0.4;
  mask += ring(st, p3, 0.015);

  mask = clamp(mask, 0.0, 1.0);

  outColor = vec4(vec3(1.0), mask*0.5); 
}