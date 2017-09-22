#version 100

// fragment shader to render lines for z-pass approach

precision highp float;

varying vec4 fragment;

void main(void)
{
    gl_FragColor = fragment;
}
