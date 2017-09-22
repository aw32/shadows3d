#version 100

// vertex shader to render lines using z-fail approach
// vertex attribute has fourth homogenous coordinate

uniform mat4 pmvMatrix;

attribute vec4 vertexPosition;

attribute vec4 vertexColor;

varying vec4 fragment;

void main()
{
    gl_Position = pmvMatrix * vertexPosition;
    fragment = vertexColor;
}
