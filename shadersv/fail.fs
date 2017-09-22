#version 100

// fragment shader to render shadow volume faces for z-fail approach

precision highp float;

varying vec4 fragment;

void main(void)
{
    gl_FragColor = fragment;
}
