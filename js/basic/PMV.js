/*
 * PMV - manages model view projection matrix
 * includes matrix creation methods known from glut
 */
function PMV(){

this._mv = new Float32Array(16);

this._p = new Float32Array(16);

}

PMV.prototype.getModelViewMatrix =
    function(){
        return this._mv;
    };

PMV.prototype.getProjectionMatrix =
    function(){
        return this._p;
    };

PMV.prototype.glLoadIdentity =
    function(mat){
        if(mat == this.GL.GL_MODELVIEW || mat == this.GL.GL_MODELVIEW_MATRIX){
            this._mv.set([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
        } else{
            this._p.set([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
        }
    };

PMV.prototype.gluLookAt =
    function(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz){
        var f = new Float32Array(3);
        f[0] = centerx - eyex;
        f[1] = centery - eyey;
        f[2] = centerz - eyez;

        CGMath.normalizeVec3(f, f);

        var up = new Float32Array([upx, upy, upz]);
        CGMath.normalizeVec3(up, up);
        var s = new Float32Array(3);
        CGMath.crossVec3(f,up,s);
        CGMath.normalizeVec3(s, s);
        var u = new Float32Array(3);
        CGMath.crossVec3(s, f, u);
        this._mv.set([
            
            s[0], u[0], -f[0], 0,
            s[1], u[1], -f[1], 0,
            s[2], u[2], -f[2], 0,
            0    , 0    , 0    , 1
        ]);

        var trans = new Float32Array([
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            -eyex, -eyey, -eyez, 1
        ]);
        CGMath.multMat4(this._mv, trans, this._mv);
    };

PMV.prototype.glOrtho =
    function(left, right, bottom, top, near, far){
        this.glLoadIdentity(this.GL.GL_PROJECTION);
        /*
            2/(r-l)  0        0         -(r+l)/(r-l)
            0        2/(t-b)  0         -(t+b)/(t-b)
            0        0        -2/(f-n)  -(f+n)/(f-n)
            0        0        0         1
        */
        this._p[0] = 2 / (right - left);
        this._p[12] = -(right + left)/(right - left);
        this._p[5] = 2 / (top - bottom);
        this._p[13] = - (top + bottom) / (top - bottom);
        this._p[10] = - 2 / (far - near);
        this._p[14] = - (far + near) / (far - near);
    };

PMV.prototype.gluPerspective =
    function(fovy, aspect, zNear, zFar){
        var top = Math.tan(fovy*(Math.PI)/360.0)*zNear;
        var bottom = -1.0*top;
        var left = aspect*bottom;
        var right = aspect*top;
        this.glFrustum(left, right, bottom, top, zNear, zFar);
    };

PMV.prototype.glFrustum =
    function(left, right, bottom, top, zNear, zFar){
        /*
            2n/r-l   0        r+l/r-l     0
            0        2n/t-b   t+b/t-b     0
            0        0        -(f+n)/f-n  -2fn/f-n
            0        0        -1          0
        */
        this._p.set([
            2 * zNear / (right - left), 0, 0, 0,
            0, 2 * zNear / (top - bottom), 0, 0,
            (right + left) / (right - left), (top + bottom) /( top - bottom), -(zFar + zNear)/(zFar - zNear), -1,
            0, 0, -2 * zFar * zNear / (zFar - zNear), 0
        ]);
    };

/*
 * special perspective projection for shadow volume approach
 */
PMV.prototype.glInfinitePerspective =
    function(fovy, aspect, zNear, eps){
        // convert half fovy to radians and compute top
        var top = Math.tan(fovy*(Math.PI)/360.0)*zNear;
        var bottom=-1.0*top;
        var left=aspect*bottom;
        var right=aspect*top;
        var epsilon = 0;
        if(eps == null)
            epsilon = Math.pow(2, -22);
        else
            epsilon = eps;
        /*
         * Perspective matrix with far plane at infinity, row-wise
         * (2n)/(r-l)  0           (r+l)/(r-l)  0
         * 0           (2n)/(t-b)  (t+b)/(t-b)  0
         * 0           0           -1           -2n
         * 0           0           -1           0
         * 
         */
        this._p.set([
            (2*zNear)/(right-left),     0,                          0,                      0,
            0,                          (2*zNear)/(top-bottom),     0,                      0,
            (right+left)/(right-left),  (top+bottom)/(top-bottom),  epsilon -1,             -1,
            0,                          0,                          (epsilon-2)*zNear,      0
        ]);
    };

PMV.prototype.GL = {
        GL_MODELVIEW : 0x1700,
        GL_MODELVIEW_MATRIX : 0x0BA6,
        GL_PROJECTION : 0x1701,
        GL_PROJECTION_MATRIX : 0x0BA7
    };

