#version 100

// vertex shader to render shadow volume faces for z-fail approach
// vertex attribute has fourth homogenous coordinate

uniform mat4 pmvMatrix;

uniform vec4 vertexColor;

attribute vec4 vertexPosition;

varying vec4 fragment;

void main()
{
    gl_Position = pmvMatrix * vertexPosition;
    fragment = vertexColor;
}
