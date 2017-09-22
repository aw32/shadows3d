#version 100

// vertex shader to draw shadow map from depth texture to frame

uniform sampler2D texture;

attribute vec2 vertexPosition;

varying vec2 texCoord;

void main()
{
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
    texCoord = (vertexPosition + 1.0) / 2.0;
}
