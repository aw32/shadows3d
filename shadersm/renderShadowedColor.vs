#version 100

// vertex shader to render scene using shadow map from color texture

uniform mat4 pmvMatrix;

uniform mat4 lightPmvMatrix;

attribute vec3 vertexPosition;

attribute vec4 vertexColor;

varying vec4 fragment;

varying highp vec4 lightCoord;

varying highp float lightDepth;

void main()
{
    gl_Position = pmvMatrix * vec4(vertexPosition, 1.0);
    lightCoord = lightPmvMatrix * vec4(vertexPosition, 1.0);
    lightDepth = lightCoord.z;
    fragment = vertexColor;
}

