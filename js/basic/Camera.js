/*
 * Camera - manages camera matrix
 */
function Camera(){

this._pmv = new PMV();

this._pmvMat = new Float32Array(16);

this._width = 0;

this._height = 0;

this._uniformId = -1;

this._currentView = new CameraView();
}

Camera.prototype.init =
    function(width, height){
        this._width = width;
        this._height = height;
        this.update(true, true);
    };

Camera.prototype.setView =
    function(view){
        this._currentView = view;
    };

Camera.prototype.getCoordinateSize =
    function(){
        return this._currentView.getCoordinateSize();
    };

Camera.prototype.updateUniform =
    function(gl,  uniformLocation){
        gl.uniformMatrix4fv(uniformLocation, false, this._pmvMat);
    };

Camera.prototype.getMatrix =
    function(){
        return this._pmvMat;
    };

Camera.prototype.reshape =
    function(gl, width, height){
        this._width = width;
        this._height = height;

        this.update(false, true);
    };

Camera.prototype.getPosition =
    function(){
        return this._currentView.getPosition();
    };

Camera.prototype.position =
    function(x, y, z){
        this._currentView.position(x,y,z);
        this.update(true,false);
    };

Camera.prototype.dimension =
    function(minHor,maxHor,minVer,maxVer){
        this._currentView.dimension(minHor,maxHor,minVer,maxVer);
        this.update(false,true);
    };

Camera.prototype.getDimension =
    function(){
        return this._currentView.getDimension();
    };

Camera.prototype.lookat =
    function(x, y, z){
        this._currentView.lookat(x,y,z);
    };

Camera.prototype.update =
    function(updateView, updateProjection){
        if(updateView)
            this._currentView.updatePosition(this);
        if(updateProjection)
            this._currentView.updateProjection(this._width, this._height, this);
        CGMath.multMat4(this._pmv.getProjectionMatrix(), this._pmv.getModelViewMatrix(), this._pmvMat);
    };

Camera.prototype._loadIdentity =
    function(){
        var result = new Float32Array(16);
        result[0] = 1;
        result[5] = 1;
        result[10] = 1;
        result[15] = 1;
        return result;
    };

Camera.prototype.getPointDirection =
    function(e){
        return this._currentView.getPointDirection(e,this);
    };

Camera.prototype.gluPerspective =
    function(fovy, aspect, zNear, zFar){
        this._pmv.gluPerspective(fovy, aspect, zNear, zFar);
    }

Camera.prototype.glOrtho =
    function(left, right, bottom, top, near, far){
        this._pmv.glOrtho(left,right,bottom,top,near,far);
    };

Camera.prototype.gluLookAt =
    function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz){
        this._pmv.gluLookAt(eyex,eyey,eyez,centerx,centery,centerz,upx,upy,upz);
    };

/*
 * CameraView - controls Camera
 */
function CameraView(){

this._position = new Float32Array(3);
this._position[2] = 1.0;

this._lookat = new Float32Array(3);
this._lookat[2] = -5.0;

this._cameraPosZ = 1.0;

this._centerPosZ = -5.0;

this._vertArea = 10;

this._horArea = 10;

}

CameraView.prototype.updateProjection =
    function(width, height, camera){
        this._horArea =  (width / height) * this._vertArea; 
        camera.glOrtho(-this._horArea, this._horArea, -this._vertArea, this._vertArea, 0.0, 2.0);
    };

CameraView.prototype.updatePosition =
    function(camera){
        camera.gluLookAt(this._position[0], this._position[1], this._cameraPosZ, this._position[0], this._position[1], this._centerPosZ, 0.0, 1.0, 0.0);
    };

CameraView.prototype.dimension =
    function(minHor,maxHor,minVer,maxVer){
        this._horArea = maxHor;
        this._vertArea = maxVer;
    };

CameraView.prototype.getDimension =
    function(){
        return [-this._horArea, this._horArea, -this._vertArea, this._vertArea, 0.0, 2.0];
    };

CameraView.prototype.getPosition =
    function(){
        return [this._position[0], this._position[1], this._cameraPosZ];
    };

CameraView.prototype.position =
    function(x, y, z){
        this._position[0] = x;
        this._position[1] = y;
        this._cameraPosZ = z;
    };

CameraView.prototype.lookat =
    function(x, y, z){

    };

CameraView.prototype.getPointDirection =
    function(e,camera){
        var dir = new Float32Array(3);
        var x1 = e.clientX / camera._width;
        var y1 = (camera._height - e.clientY) / camera._height;
        x1 = x1 * this._horArea * 2.0 - this._horArea;
        y1 = y1 * this._vertArea * 2.0 - this._vertArea;
        dir[0] = x1 + this._position[0];
        dir[1] = y1 + this._position[1];
        dir[2] = 0;
        return dir;
    };

CameraView.prototype.getCoordinateSize =
    function(){
        return new CoordinateSize(this._position[0] - this._horArea, this._position[1] - this._vertArea, this._horArea*2.0, this._vertArea*2.0);
    };

// process input events to change camera
CameraView.prototype.consumeEvent =
    function(e, camera){
        return false;
    };
