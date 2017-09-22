#version 100

// fragment shader to render scene using shadow map from color texture
// depth value shall be packed as rgba components

precision highp float;

varying vec4 fragment;

varying highp vec4 lightCoord;

varying highp float lightDepth;

uniform sampler2D shadowMap;

uniform int drawSM;

uniform float bias;


    float unpack (vec4 colour)
    {
        const vec4 bitShifts = vec4(1.0 / (255.0 * 255.0 * 255.0),
                                    1.0 / (255.0 * 255.0),
                                    1.0 / 255.0,
                                    1);
        return dot(colour , bitShifts);
    }


void main(void)
{
// real 8bit without packing 

//    float visibility = 1.0;
//    if(lightCoord.x<=1.0 && lightCoord.x>=0.0 && lightCoord.y<=1.0 && lightCoord.y>=0.0){
//        if ( texture2D( shadowMap, lightCoord.xy ).r  <  lightCoord.z-bias){
//            visibility = 0.5;
//        }
//    }
//    gl_FragColor = vec4(fragment.rgb * visibility,1.0);

    if(drawSM == 1) {
        // simply draw texture
        highp float valf = unpack(texture2D( shadowMap, lightCoord.xy ));
        gl_FragColor = vec4(valf, valf, valf, 1.0);
        //gl_FragColor = texture2D( shadowMap, lightCoord.xy ); // draw packed texture

    } else {
        // unpack depth value
        float visibility = 1.0;
        if(lightCoord.x<=1.0 && lightCoord.x>=0.0 && lightCoord.y<=1.0 && lightCoord.y>=0.0){
            highp float valf = unpack(texture2D( shadowMap, lightCoord.xy ));

            if ( valf  <  lightCoord.z-bias){
                visibility = 0.5;
            }
        }
        gl_FragColor = vec4(fragment.rgb * visibility,1.0);
    }
}
