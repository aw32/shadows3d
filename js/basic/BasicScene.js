/*
 * BasicScene defines basic attributes and functions of a basic scene
 * Used as parent class for custom scenes
 * Assumed by GLApp
 */
function BasicScene(){

this._width = 0;

this._height = 0;

this._ressourceList = [];

}


BasicScene.prototype.init =
    function(eventFifo, width, height, gl){
    };

BasicScene.prototype.display =
    function(gl){
    };

BasicScene.prototype.dispose =
    function(gl){
    };

BasicScene.prototype.reshape =
    function(gl, width, height){
        this._width = width;
        this._height = height;
    };

BasicScene.prototype.consumeEvent =
    function(e){
        return true;
    };

BasicScene.prototype.getWidth =
    function(){
        return this._width;
    };

BasicScene.prototype.getHeight =
    function(){
        return this._height;
    };

BasicScene.prototype.getRessourceList =
    function(){
        return this._ressourceList;
    };
