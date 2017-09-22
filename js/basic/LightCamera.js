/*
 * LightCamera - used for shadow map scene to render shadow map
 */
function LightCamera(){

this._position = new Float32Array(3);
this._position.set([3,0,0]);

this._lookat = new Float32Array(3);
this._up = new Float32Array(3);
this._up.set([0,1,0]);
}


LightCamera.prototype.updateProjection =
    function(width, height, camera){
        //camera.glOrtho(-10,10,-10,10,-10,20);
        camera.glOrtho(-4,4,-4,4,0,8);
    };

LightCamera.prototype.updatePosition =
    function(camera){
        camera.gluLookAt(this._position[0], this._position[1], this._position[2],
        this._lookat[0], this._lookat[1], this._lookat[2],
        this._up[0], this._up[1], this._up[2]);
    };

LightCamera.prototype.dimension =
    function(minHor,maxHor,minVer,maxVer){
    };

LightCamera.prototype.getDimension =
    function(){
        return [0,0,0,0,0,0];
    };

LightCamera.prototype.getPosition =
    function(){
        this._position;
    };

LightCamera.prototype.position =
    function(x, y, z){
        this._position.set([x,y,z]);
    };

LightCamera.prototype.lookat =
    function(x, y, z){
        this._lookat.set([x,y,z]);
    };
LightCamera.prototype.getPointDirection =
    function(e,camera){
        return [0,0,0];
    };

LightCamera.prototype.getCoordinateSize =
    function(){
        return {};
    };

LightCamera.prototype.consumeEvent =
    function(e, camera){
        return false;
    };


