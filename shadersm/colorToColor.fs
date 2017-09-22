#version 100

// fragment shader to draw shadow map from color texture to frame
// expects packed depth value, see create shadow map shader

precision highp float;

uniform sampler2D texture;

varying vec2 texCoord;

float unpack (vec4 colour)
        {
            const vec4 bitShifts = vec4(1.0 / (255.0 * 255.0 * 255.0),
                                        1.0 / (255.0 * 255.0),
                                        1.0 / 255.0,
                                        1);
            return dot(colour , bitShifts);
        }

void main(void)
{
    highp vec4 texel = texture2D(texture, texCoord);
    float depth = unpack(texel);
    gl_FragColor = vec4(depth, depth, depth, 1.0);
}
