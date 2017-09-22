#version 100

// fragment texture to draw shadow map from depth texture to frame

precision highp float;

uniform sampler2D texture;

varying vec2 texCoord;

void main(void)
{
    highp vec4 texel = texture2D(texture, texCoord);
    gl_FragColor = vec4(texel.z, texel.z, texel.z, 1.0);
}
