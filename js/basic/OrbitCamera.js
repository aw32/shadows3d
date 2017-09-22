/*
 * OrbitCamera - camera orbits around look at point
 */
function OrbitCamera(){

this._position = new Float32Array(3);
this._position.set([3,0,0]);

this._lookat = new Float32Array(3);

this._up = new Float32Array(3);
this._up.set([0,1,0]);

this._right = new Float32Array(3);
this._right.set([0,0,1]);

this._cameraPosZ = 1.0;

this._centerPosZ = -5.0;

this._vertArea = 10;

this._horArea = 10;

this._horAngle = 0;

this._verAngle = 0;

this._distance = 3;

this._horD = 5;
this._verD = 5;
this._disD = 0.5;

//input stuff
this._mousePressed = false;
this._lastMouseCoord = new Float32Array(2);

this._updatePosition();

this._type = "orbit";

};

OrbitCamera.prototype.fromJSON =
    function(json){
        for(var key in json)
            this[key] = json[key];
        this._position = new Float32Array(3);
        Tools.setObjToTypedArray(json._position, this._position);
        this._lookat = new Float32Array(3);
        Tools.setObjToTypedArray(json._lookat, this._lookat);
        this._up = new Float32Array(3);
        Tools.setObjToTypedArray(json._up, this._up);
        this._right = new Float32Array(3);
        Tools.setObjToTypedArray(json._right, this._right);
        this._lastMouseCoord = new Float32Array(2);
        Tools.setObjToTypedArray(json._lastMouseCoord, this._lastMouseCoord);
    };

OrbitCamera.prototype.updateProjection =
    function(width, height, camera){
        camera.gluPerspective(60, width/height, 0.1, 40);
    };

OrbitCamera.prototype.updatePosition =
    function(camera){
        camera.gluLookAt(this._position[0], this._position[1], this._position[2], 
        this._lookat[0], this._lookat[1], this._lookat[2], 
        this._up[0], this._up[1], this._up[2]);
    };

OrbitCamera.prototype._horChange =
    function(change){
        this._horAngle = CGMath.mod(this._horAngle + change, 360);
        this._updatePosition();
    };

OrbitCamera.prototype._verChange =
    function(change){
        this._verAngle = CGMath.mod(this._verAngle + change, 360);
        this._updatePosition();
    };

OrbitCamera.prototype._disChange =
    function(change){
        this._distance = Math.max(1,this._distance + change);
        this._updatePosition();
    };

OrbitCamera.prototype._updatePosition =
    function(){

        var quatH = new Quaternion();
        quatH.axisAngle([0,1,0], this._horAngle);

        var dir = new Float32Array([1,0,0]);
        quatH.rotateVector(dir,dir);

        var right = new Float32Array([0,0,-1]);
        quatH.rotateVector(right,right);

        var quatV = new Quaternion();
        quatV.axisAngle(right, this._verAngle);
        
        quatV.rotateVector(dir,dir);
        var dirN = [];
        CGMath.normalizeVec3(dir,dirN);
        this._position = [
            this._lookat[0] - dirN[0]*this._distance, 
            this._lookat[1] - dirN[1]*this._distance,
            this._lookat[2] - dirN[2]*this._distance
        ];
    };

OrbitCamera.prototype.dimension =
    function(minHor,maxHor,minVer,maxVer){
    };

OrbitCamera.prototype.getDimension =
    function(){
        return [0,0,0,0,0,0];
    };

OrbitCamera.prototype.getPosition =
    function(){
        this._position;
    };

OrbitCamera.prototype.position =
    function(x, y, z){
        this._position.set([x,y,z]);
    };

OrbitCamera.prototype.lookat =
    function(x, y, z){
        this._lookat.set([x,y,z]);
    };
OrbitCamera.prototype.getPointDirection =
    function(e,camera){
        return [0,0,0];
    };

OrbitCamera.prototype.getCoordinateSize =
    function(){
        return {};
    };

OrbitCamera.prototype.consumeEvent =
    function(e, camera){
        if(e.type === "keydown") {
            if(e.key === "ArrowLeft" || e.key === "Left" || e.keyCode === 37){
                this._horChange(this._horD);
            } else
            if(e.key === "ArrowRight" || e.key === "Right" || e.keyCode === 39){
                this._horChange(-this._horD);
            } else
            if(e.key === "ArrowUp" || e.key === "Up" || e.keyCode === 38){
                this._verChange(this._verD);
            } else
            if(e.key === "ArrowDown" || e.key === "Down" || e.keyCode === 40){
                this._verChange(-this._verD);
            } else
            if(e.key === "PageUp" || e.keyCode === 33 || e.key === "+" || e.keyCode === 187) {
                this._disChange(-this._disD);
            } else
            if(e.key === "PageDown" || e.keyCode === 34 || e.key === "-" || e.keyCode === 189){
                this._disChange(this._disD);
            } else
            if(e.key === " " || e.keyCode === 32){
                this._horAngle = 0;
                this._verAngle = 0;
                this._distance = 5;
                this._updatePosition();
            }


        } else
        if(e.type === "wheel"){
            this._disChange(e.deltaY*(1/64));
        } else
        if(e.type === "mousedown"){
            this._mousePressed = true;
            this._lastMouseCoord[0] = e.clientX;
            this._lastMouseCoord[1] = e.clientY;
        } else
        if(e.type === "mouseup"){
            this._mousePressed = false;
        } else
        if(e.type === "mousemove"){
            if(this._mousePressed){
                this._horChange(-(1/2)*360*(e.clientX - this._lastMouseCoord[0])/ camera._width);
                this._verChange((1/2)*360*(e.clientY - this._lastMouseCoord[1])/ camera._height);
                this._lastMouseCoord[0] = e.clientX;
                this._lastMouseCoord[1] = e.clientY;
            }
        }

        return false;
    };
