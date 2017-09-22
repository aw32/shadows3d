#version 100

// fragment shader to render normal scene

precision highp float;

varying vec4 fragment;

void main(void)
{
    gl_FragColor = fragment;
}
