#version 100

// vertex shader to create shadow map using depth texture
// essentially normal rendering

uniform mat4 pmvMatrix;

attribute vec3 vertexPosition;

void main()
{
    gl_Position = pmvMatrix * vec4(vertexPosition, 1.0);
}

