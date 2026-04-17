#version 300 es

// This is a full screen shader. We need to slice it into as many CELL_SIZE pixels as possible
// Within each cell we start with taking the lumi of the center point of that cell
// Then use that luminance to do a lookup of what character it should use
// Then sample the right pixel of the character to render

precision mediump float;
 
in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_char_aspect;
uniform sampler2D u_character_texture;
uniform sampler2D u_mask_texture;

#define COLOUR_BACKGROUND vec3(0.8, 0.82, 0.85)
#define COLOUR_FOREGROUND vec3(0.0, 0.0, 0.4)

#define CELL_SIZE 12.0
#define CHAR_WIDTH 64.0
struct CellData {
    vec2 origin;
    vec2 center;
    vec2 local;
};

CellData cell_create(vec2 uv) {
    float screen_aspect = u_resolution.x / u_resolution.y;
    
    float count = u_resolution.x / CELL_SIZE;

    float cells_x = count;
    float cells_y = count * u_char_aspect / screen_aspect; 
    
    vec2 cell_count = vec2(cells_x, cells_y);
    vec2 cell_size = 1.0 / cell_count;

    CellData data;
    data.origin = floor(uv * cell_count) / cell_count;
    data.center = data.origin + (cell_size * 0.5);
    data.local = fract(uv * cell_count); 

    return data;
}



void main() {
  CellData cell = cell_create(v_uv);
  ivec2 character_texture_size = textureSize(u_character_texture, 0);



  float mask = texture(u_mask_texture, cell.center).r;

  vec2 texture_position = vec2(
    (cell.local.x + floor(mix(-1.0, 8.0, mask))) * (CHAR_WIDTH / float(character_texture_size.x)),
    cell.local.y
  );

  vec4 s = texture(u_character_texture, texture_position);
  outColor = vec4(
    mix(COLOUR_BACKGROUND, COLOUR_FOREGROUND, s.r),
    1.0
  );
}