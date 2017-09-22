#version 100

// fragment shader to create shadow map using color texture
// depth value is split to rgba components to increase precision
// alternatively simply store value as single 8 bit color component

precision highp float;

vec4 pack (float depth)
        {
            const vec4 bitSh = vec4(255 * 255 * 255,
                                    255 * 255,
                                    255,
                                    1.0);
            const vec4 bitMsk = vec4(0,
                                     1.0 / 255.0,
                                     1.0 / 255.0,
                                     1.0 / 255.0);
            vec4 comp = fract(depth * bitSh);
            comp -= comp.xxyz * bitMsk;
            return comp;
        }

void main(void)
{
    gl_FragColor = pack(gl_FragCoord.z);
    // real 8 bit, save depth unpacked
    //gl_FragColor = vec4(gl_FragCoord.z, gl_FragCoord.z, gl_FragCoord.z, 1.0);
}
