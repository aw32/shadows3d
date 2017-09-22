#version 100

// fragment shader to render scene using shadow map from depth texture

precision highp float;

varying vec4 fragment;

varying vec4 lightCoord;

uniform sampler2D shadowMap;

uniform int drawSM;

uniform float bias;

void main(void)
{


    if(drawSM == 1){
        // simply draw texture
        float val = texture2D( shadowMap, lightCoord.xy ).z;
        gl_FragColor = vec4(val,val,val,1.0);

    } else {

        float visibility = 1.0;
        if(lightCoord.x<=1.0 && lightCoord.x>=0.0 && lightCoord.y<=1.0 && lightCoord.y>=0.0){
            if ( texture2D( shadowMap, lightCoord.xy ).z  <  lightCoord.z-bias){

                visibility = 0.5;
            }
        }

        gl_FragColor = vec4(fragment.rgb * visibility,1.0);

    }
         
}
