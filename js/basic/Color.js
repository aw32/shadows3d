/*
 * Color defines a color using 4 components: red, green, blue, opacity (1.0 - visible, 0.0 - transparent)
 */
function Color(red,green,blue,alpha){

this.r = red;
this.g = green;
this.b = blue;
this.a = alpha;


}

Color.prototype.hex = 
    function(){
        return '#'+red.toString(16)+green.toString(16)+blue.toString(16)+alpha.toString(16);
    };
