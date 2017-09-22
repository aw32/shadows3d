/*
 * Quaternion - represents a quaternion
 */
function Quaternion(){

this._w = 0;

this._x = 0;

this._y = 0;

this._z = 0;

}

Quaternion.prototype.set =
    function(w,x,y,z){
        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;
    };

Quaternion.prototype._normalize =
    function(){
        var norm = this.norm();
        if(norm != 0) {
            this._w = this._w / norm;
            this._x = this._x / norm;
            this._y = this._y / norm;
            this._z = this._z / norm;
        }
    };

Quaternion.prototype.inverse =
    function(){
        var div = this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z;
        if (div == 0)
            return;
        this.konjugate();
        this._w = this._w / div;
        this._x = this._x / div;
        this._y = this._y / div;
        this._z = this._z / div;
    };

Quaternion.prototype.axisAngle =
    function(axis3, angleDeg){
        var angleRad = CGMath.toRadians(angleDeg);
        var alpha = angleRad / 2;
        var c = Math.cos(alpha);
        var s = Math.sin(alpha);
        this._w = c;
        this._x = axis3[0] * s;
        this._y = axis3[1] * s;
        this._z = axis3[2] * s;
    };

Quaternion.prototype.konjugate =
    function(){
        //var w = this._w;
        var x = - this._x;
        var y = - this._y;
        var z = - this._z;
        //this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;
    };

Quaternion.prototype.norm =
    function(){
        var norm = Math.sqrt(this._w * this._w + this._x * this._x + this._y * this._y + this._z * this._z);
        return norm;
    };

Quaternion.prototype.mult =
    function(quat){
        var w = this._w * quat._w - this._x * quat._x - this._y * quat._y - this._z * quat._z;
        var x = this._x * quat._x + this._y * quat._w + this._y * quat._z - this._z * quat._y;
        var y = this._x * quat._y - this._y * quat._z + this._y * quat._w + this._z * quat._x;
        var z = this._x * quat._z + this._y * quat._y - this._y * quat._x + this._z * quat._w;
        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;
    };

Quaternion.prototype.add =
    function(quat){
        var w = this._w + quat._w;
        var x = this._x + quat._x;
        var y = this._y + quat._y;
        var z = this._z + quat._z;
        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;
    };

Quaternion.prototype.rotateVector =
    function(vertex3, result){
        var v0 = vertex3[0];
        var v1 = vertex3[1];
        var v2 = vertex3[2];
        var a00 = this._w * this._w;
        var a01 = this._w * this._x;
        var a02 = this._w * this._y;
        var a03 = this._w * this._z;
        var a11 = this._x * this._x;
        var a12 = this._x * this._y;
        var a13 = this._x * this._z;
        var a22 = this._y * this._y;
        var a23 = this._y * this._z;
        var a33 = this._z * this._z;
        result[0] = v0 * ( a00 + a11 - a22 - a33) +
                2 * (a12 * v1 + a13 * v2 + a02 * v2 - a03 * v1);
        result[1] = v1 * (a00 - a11 + a22 - a33) +
                2 * (a12 * v0 + a23 * v2 + a03 * v0 - a01 * v2);
        result[2] = v2 * (a00 - a11 - a22 + a33) + 
                2 * (a13 * v0 + a23 * v1 - a02 * v0 + a01 * v1);
    };


Quaternion.prototype.toMatrix =
    function(mat){
        var q0 = this._w * this._w;
        var q1 = this._x * this._x;
        var q2 = this._y * this._y;
        var q3 = this._z * this._z;
        var q01 = this._w * this._x;
        var q02 = this._w * this._y;
        var q03 = this._w * this._z;
        var q12 = this._x * this._y;
        var q13 = this._x * this._z;
        var q23 = this._y * this._z;
        mat.set([
            1 - 2 * (q2 + q3)  ,  - 2 * q03 + 2 * q12,  2 * q02 + 2 * q13,
            2 * q03 + 2 * q12  ,  1 - 2 * (q1 + q3)  ,  - 2 * q01 + 2 * q23,
            - 2 * q02 + 2 * q13,  2 * q01 + 2 * q23  ,  1 - 2 * (q1 + q2)
        ]);
    };

Quaternion.prototype.toMatrix4 =
    function(mat){
        var q0 = this._w * this._w;
        var q1 = this._x * this._x;
        var q2 = this._y * this._y;
        var q3 = this._z * this._z;
        var q01 = this._w * this._x;
        var q02 = this._w * this._y;
        var q03 = this._w * this._z;
        var q12 = this._x * this._y;
        var q13 = this._x * this._z;
        var q23 = this._y * this._z;
        mat.set([
            1.0 - 2 * (q2 + q3) ,   2 * q03 + 2 * q12, - 2 * q02 + 2 * q13, 0,
            -2 * q03 + 2 * q12  ,  1 - 2 * (q1 + q3)  ,   2 * q01 + 2 * q23, 0,
             2 * q02 + 2 * q13, - 2 * q01 + 2 * q23  ,  1 - 2 * (q1 + q2), 0,
            0                  ,  0                  ,  0                , 1.0
        ]);
    };

Quaternion.prototype.fromMatrix =
    function(mat){
        //https://en.wikipedia.org/wiki/Rotation_matrix#Quaternion
        var trace = mat[0] + mat[4] + mat[8];
        if (trace > 0) {
            var r = Math.sqrt(1 + trace);
            var s = 0.5 / r;
            this._w = 0.5 * r;
            this._x = (mat[7] - mat[5]) * s;
            this._y = (mat[2] - mat[6]) * s;
            this._z = (mat[3] - mat[1]) * s;
        } else {
            var r = Math.sqrt(1 + mat[0] - mat[4] - mat[8]);
            var s = 0.5 / r;
            this._w = (mat[7] - mat[5]) * s;
            this._x = 0.5 * r;
            this._y = (mat[3] + mat[1]) * s;
            this._z = (mat[2] + mat[6]) * s;
        }
    };

Quaternion.prototype.toStr =
    function(){
        return "[Q x:"+this._x+" y:"+this._y+" z:"+this._z+" w:"+this._w+"]";
    };

