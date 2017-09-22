#version 100

// fragment shader to render scene in shadow

precision highp float;

varying vec4 fragment;

void main(void)
{
    gl_FragColor = vec4(fragment.rgb * 0.5, fragment.a);
}
