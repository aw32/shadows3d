#version 100

// vertex shader to render scene in shadow

uniform mat4 pmvMatrix;

attribute vec3 vertexPosition;

attribute vec4 vertexColor;

varying vec4 fragment;

void main()
{
    gl_Position = pmvMatrix * vec4(vertexPosition, 1.0);
    fragment = vertexColor;
}
