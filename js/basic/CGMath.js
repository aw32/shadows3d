/*
 * CGMath
 * This class offers mathematical methods for standard operations on
 * column-major wise matrices of size 4, 9 and 16 and vectors of 
 * size 2, 3 and 4.
 * For certain methods the given result matrix may
 * be an input matrix, without breaking the methods.
 * If you want to use this behavior, please first check the method.
 * 
 * For a more consistent and faster vector/matrix math class please look at classes like
 * glMatrix or math classes from three.js.
 */

CGMath = {};

CGMath._id2 = [1,0, 0,1];
CGMath._id3 = [1,0,0, 0,1,0, 0,0,1];
CGMath._id4 = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

CGMath.identity2 =
    function(mat){
        mat.set(CGMath._id2);
    };

CGMath.identity3 =
    function(mat){
        mat.set(CGMath._id3);
    };

CGMath.identity4 =
    function(mat){
        mat.set(CGMath._id4);
    };

CGMath.determinant2 =
    function(mat){
        var result = mat[0] * mat[3] - mat[1] * mat[2];
        return result;
    };

CGMath.determinant3 =
    function(m){
        return m[0] * ( m[4] * m[8] - m[7] * m[5] ) - m[3] * ( m[1] * m[8] - m[7] * m[2] ) + m[6] * ( m[1] * m[5] - m[4] * m[2] );
    };

CGMath.determinant4 =
    function(mat){
        var result =
            mat[0] * mat[5] * mat[10] * mat[15] + mat[0] * mat[9] * mat[14] * mat[7] + mat[0] * mat[13] * mat[6] * mat[11]
                + mat[4] * mat[1] * mat[14] * mat[11] + mat[4] * mat[9] * mat[2] * mat[15] + mat[4] * mat[13] * mat[10] * mat[3]
                + mat[8] * mat[1] * mat[6] * mat[15] + mat[8] * mat[5] * mat[14] * mat[3] + mat[8] * mat[13] * mat[2] * mat[7]
                + mat[12] * mat[1] * mat[10] * mat[7] + mat[12] * mat[5] * mat[2] * mat[11] + mat[12] * mat[9] * mat[6] * mat[3]
                - mat[0] * mat[5] * mat[14] * mat[11] - mat[0] * mat[9] * mat[6] * mat[15] - mat[0] * mat[13] * mat[10] * mat[7]
                - mat[4] * mat[1] * mat[10] * mat[15] - mat[4] * mat[9] * mat[14] * mat[3] - mat[4] * mat[13] * mat[2] * mat[11]
                - mat[8] * mat[1] * mat[14] * mat[7] - mat[8] * mat[5] * mat[2] * mat[15] - mat[8] * mat[13] * mat[6] * mat[3]
                - mat[12] * mat[1] * mat[6] * mat[11] - mat[12] * mat[5] * mat[10] * mat[3] - mat[12] * mat[9] * mat[2] * mat[7];
        return result;
    };

CGMath.inverseMat2 =
    function(mat, result){
        var detI = 1 / CGMath.determinant2(mat);
        result.set([
            mat[3] * detI,   - mat[1] * detI,
            - mat[2] * detI, mat[0] * detI
        ]);
    };

CGMath.inverseMat3 =
    function(m, result){
        var detI = 1 / CGMath.determinant3(m);
        result.set([
            ( m[4] * m[8] - m[7] * m[5] ) * detI, ( m[7] * m[2] - m[1] * m[8] ) * detI, ( m[1] * m[5] - m[4] * m[2] ) * detI,
            ( m[6] * m[5] - m[3] * m[8] ) * detI, ( m[0] * m[8] - m[6] * m[2] ) * detI, ( m[3] * m[2] - m[0] * m[5] ) * detI,
            ( m[3] * m[7] - m[6] * m[4] ) * detI, ( m[6] * m[1] - m[0] * m[7] ) * detI, ( m[0] * m[4] - m[3] * m[1] ) * detI
        ]);
    };

CGMath.inverseMat4 = 
    function(a, result){
        var detI = 1 / CGMath.determinant4(a);
/*
        result[0] = (a[5] * a[10] * a[15] + a[9] * a[14] * a[7] + a[13] * a[6] * a[11] - a[5] * a[14] * a[11] - a[9] * a[6] * a[15] - a[13] * a[10] * a[7]) * detI;
        result[4] = (a[4] * a[14] * a[11] + a[8] * a[6] * a[15] + a[12] * a[10] * a[7] - a[4] * a[10] * a[15] - a[8] * a[14] * a[7] - a[12] * a[6] * a[11]) * detI;
        result[8] = (a[4] * a[9] * a[15] + a[8] * a[13] * a[7] + a[12] * a[5] * a[11] - a[4] * a[13] * a[11] - a[8] * a[5] * a[15] - a[12] * a[9] * a[7]) * detI;
        result[12] = (a[4] * a[13] * a[10] + a[8] * a[5] * a[14] + a[12] * a[9] * a[6] - a[4] * a[9] * a[14] - a[8] * a[13] * a[6] - a[12] * a[5] * a[10]) * detI;
        result[1] = (a[1] * a[14] * a[11] + a[9] * a[2] * a[15] + a[13] * a[10] * a[3] - a[1] * a[10] * a[15] - a[9] * a[14] * a[3] - a[13] * a[2] * a[11]) * detI;
        result[5] = (a[0] * a[10] * a[15] + a[8] * a[14] * a[3] + a[12] * a[2] * a[11] - a[0] * a[14] * a[11] - a[8] * a[2] * a[15] - a[12] * a[10] * a[3]) * detI;
        result[9] = (a[0] * a[13] * a[11] + a[8] * a[1] * a[15] + a[12] * a[9] * a[3] - a[0] * a[9] * a[15] - a[8] * a[13] * a[3] - a[12] * a[1] * a[11]) * detI;
        result[13] = (a[0] * a[9] * a[14] + a[8] * a[13] * a[2] + a[12] * a[1] * a[10] - a[0] * a[13] * a[10] - a[8] * a[1] * a[14] - a[12] * a[9] * a[2]) * detI;
        result[2] = (a[1] * a[6] * a[15] + a[5] * a[14] * a[3] + a[13] * a[2] * a[7] - a[1] * a[14] * a[7] - a[5] * a[2] * a[15] - a[13] * a[6] * a[3]) * detI;
        result[6] = (a[0] * a[14] * a[7] + a[4] * a[2] * a[15] + a[12] * a[6] * a[3] - a[0] * a[6] * a[15] - a[4] * a[14] * a[3] - a[12] * a[2] * a[7]) * detI;
        result[10] = (a[0] * a[5] * a[15] + a[4] * a[13] * a[3] + a[12] * a[1] * a[7] - a[0] * a[13] * a[7] - a[4] * a[1] * a[15] - a[12] * a[5] * a[3]) * detI;
        result[14] = (a[0] * a[13] * a[6] + a[4] * a[1] * a[14] + a[12] * a[5] * a[2] - a[0] * a[5] * a[14] - a[4] * a[13] * a[2] - a[12] * a[1] * a[6]) * detI;
        result[3] = (a[1] * a[10] * a[7] + a[5] * a[2] * a[11] + a[9] * a[6] * a[3] - a[1] * a[6] * a[11] - a[5] * a[10] * a[3] - a[9] * a[2] * a[7]) * detI;
        result[7] = (a[0] * a[6] * a[11] + a[4] * a[10] * a[3] + a[8] * a[2] * a[7] - a[0] * a[10] * a[7] - a[4] * a[2] * a[11] - a[8] * a[6] * a[3]) * detI;
        result[11] = (a[0] * a[9] * a[7] + a[4] * a[1] * a[11] + a[8] * a[5] * a[3] - a[0] * a[5] * a[11] - a[4] * a[9] * a[3] - a[8] * a[1] * a[7]) * detI;
        result[15] = (a[0] * a[5] * a[10] + a[4] * a[9] * a[2] + a[8] * a[1] * a[6] - a[0] * a[9] * a[6] - a[4] * a[1] * a[10] - a[8] * a[5] * a[2]) * detI;
*/
        result.set([
            (a[5] * a[10] * a[15] + a[9] * a[14] * a[7] + a[13] * a[6] * a[11] - a[5] * a[14] * a[11] - a[9] * a[6] * a[15] - a[13] * a[10] * a[7]) * detI,
            (a[1] * a[14] * a[11] + a[9] * a[2] * a[15] + a[13] * a[10] * a[3] - a[1] * a[10] * a[15] - a[9] * a[14] * a[3] - a[13] * a[2] * a[11]) * detI,
            (a[1] * a[6] * a[15] + a[5] * a[14] * a[3] + a[13] * a[2] * a[7] - a[1] * a[14] * a[7] - a[5] * a[2] * a[15] - a[13] * a[6] * a[3]) * detI,
            (a[1] * a[10] * a[7] + a[5] * a[2] * a[11] + a[9] * a[6] * a[3] - a[1] * a[6] * a[11] - a[5] * a[10] * a[3] - a[9] * a[2] * a[7]) * detI,
            (a[4] * a[14] * a[11] + a[8] * a[6] * a[15] + a[12] * a[10] * a[7] - a[4] * a[10] * a[15] - a[8] * a[14] * a[7] - a[12] * a[6] * a[11]) * detI,
            (a[0] * a[10] * a[15] + a[8] * a[14] * a[3] + a[12] * a[2] * a[11] - a[0] * a[14] * a[11] - a[8] * a[2] * a[15] - a[12] * a[10] * a[3]) * detI,
            (a[0] * a[14] * a[7] + a[4] * a[2] * a[15] + a[12] * a[6] * a[3] - a[0] * a[6] * a[15] - a[4] * a[14] * a[3] - a[12] * a[2] * a[7]) * detI,
            (a[0] * a[6] * a[11] + a[4] * a[10] * a[3] + a[8] * a[2] * a[7] - a[0] * a[10] * a[7] - a[4] * a[2] * a[11] - a[8] * a[6] * a[3]) * detI,
            (a[4] * a[9] * a[15] + a[8] * a[13] * a[7] + a[12] * a[5] * a[11] - a[4] * a[13] * a[11] - a[8] * a[5] * a[15] - a[12] * a[9] * a[7]) * detI,
            (a[0] * a[13] * a[11] + a[8] * a[1] * a[15] + a[12] * a[9] * a[3] - a[0] * a[9] * a[15] - a[8] * a[13] * a[3] - a[12] * a[1] * a[11]) * detI,
            (a[0] * a[5] * a[15] + a[4] * a[13] * a[3] + a[12] * a[1] * a[7] - a[0] * a[13] * a[7] - a[4] * a[1] * a[15] - a[12] * a[5] * a[3]) * detI,
            (a[0] * a[9] * a[7] + a[4] * a[1] * a[11] + a[8] * a[5] * a[3] - a[0] * a[5] * a[11] - a[4] * a[9] * a[3] - a[8] * a[1] * a[7]) * detI,
            (a[4] * a[13] * a[10] + a[8] * a[5] * a[14] + a[12] * a[9] * a[6] - a[4] * a[9] * a[14] - a[8] * a[13] * a[6] - a[12] * a[5] * a[10]) * detI,
            (a[0] * a[9] * a[14] + a[8] * a[13] * a[2] + a[12] * a[1] * a[10] - a[0] * a[13] * a[10] - a[8] * a[1] * a[14] - a[12] * a[9] * a[2]) * detI,
            (a[0] * a[13] * a[6] + a[4] * a[1] * a[14] + a[12] * a[5] * a[2] - a[0] * a[5] * a[14] - a[4] * a[13] * a[2] - a[12] * a[1] * a[6]) * detI,
            (a[0] * a[5] * a[10] + a[4] * a[9] * a[2] + a[8] * a[1] * a[6] - a[0] * a[9] * a[6] - a[4] * a[1] * a[10] - a[8] * a[5] * a[2]) * detI
        ]);
    };

CGMath.transposeMat2 =
    function(a,res){
        res.set([
            a[0], a[2],
            a[1], a[3]
        ]);
    };

CGMath.transposeMat3 =
    function(a,res){
        res.set([
            a[0], a[3], a[6],
            a[1], a[4], a[7],
            a[2], a[5], a[8]
        ]);
    };

CGMath.transposeMat4 =
    function(a,res){
        res.set([
            a[0], a[4], a[8], a[12],
            a[1], a[5], a[9], a[13],
            a[2], a[6], a[10],a[14],
            a[3], a[7], a[11],a[15]
        ]);
    };

CGMath.normalizeVec2 =
    function(v, result){
        var length = v[0]*v[0] + v[1]*v[1];
        if(length !== 0){
            var inv = 1 / Math.sqrt(length);
            result[0] = v[0]  * inv;
            result[1] = v[1]  * inv;
        }
    };

CGMath.normalizeVec3 =
    function(v, result){
        var length = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
        if(length !== 0){
            var inv = 1 / Math.sqrt(length);
            result[0] = v[0] * inv;
            result[1] = v[1] * inv;
            result[2] = v[2] * inv;
        }
    };

CGMath.normalizeVec4 =
    function(v, result){
        var length = v[0]*v[0] + v[1]*v[1] + v[2]*v[2] + v[3]*v[3];
        if(length !== 0){
            var inv = 1 / Math.sqrt(length);
            result[0] = v[0] * inv;
            result[1] = v[1] * inv;
            result[2] = v[2] * inv;
            result[3] = v[3] * inv;
        }
    };

CGMath.normVec2 =
    function(v){
        return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
    };

CGMath.normVec3 =
    function(v){
        return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    };

CGMath.normVec4 =
    function(v){
        return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2] + v[3]*v[3]);
    };
    
CGMath.dotVec2 =
    function(v,u){
        return v[0]*u[0] + v[1]*u[1];
    };

CGMath.dotVec3 =
    function(v,u){
        return v[0]*u[0] + v[1]*u[1] + v[2]*u[2];
    };

CGMath.dotVec4 =
    function(v,u){
        return v[0]*u[0] + v[1]*u[1] + v[2]*u[2] + v[3]*u[3];
    };

CGMath.angleVec2 =
    function(v,u){
        var dot = CGMath.dotVec2(v,u);
        var cos = dot / (CGMath.normVec2(v) * CGMath.normVec2(u));
        return CGMath.toDegrees(Math.acos(cos));
    };

CGMath.angleVec3 =
    function(v,u){
        var dot = CGMath.dotVec3(v,u);
        var cos = dot / (CGMath.normVec3(v) * CGMath.normVec3(u));
        return CGMath.toDegrees(Math.acos(cos));
    };

CGMath.angleVec4 =
    function(v,u){
        var dot = CGMath.dotVec4(v,u);
        var cos = dot / (CGMath.normVec4(v) * CGMath.normVec4(u));
        return CGMath.toDegrees(Math.acos(cos));
    };

CGMath.crossVec2 =
    function(v, result){
        result.set([
            v[1],
            -v[0]
        ]);
    };

CGMath.crossVec3 =
    function(v,u,result){
        result.set([
            v[1] * u[2] - v[2] * u[1],
            v[2] * u[0] - v[0] * u[2],
            v[0] * u[1] - v[1] * u[0]
        ]);
    };

//TODO: adapt crossVec4 e.g. from http://steve.hollasch.net/thesis/chapter2.html

CGMath.multMat2 =
    function(b,a,result){
        result.set([
            a[0]*b[0]+a[1]*b[2] , a[0]*b[1]+a[1]*b[3],
            a[2]*b[0]+a[3]*b[2] , a[2]*b[1]+a[3]*b[3]
        ]);
    };

CGMath.multMat3 =
    function(b,a,result){
        result.set([
            a[0]*b[0]+a[1]*b[3]+a[2]*b[2] , a[0]*b[1]+a[1]*b[4]+a[2]*b[5] , a[0]*b[2]+a[1]*b[5]+a[2]*b[8],
            a[3]*b[0]+a[4]*b[3]+a[5]*b[2] , a[3]*b[1]+a[4]*b[4]+a[5]*b[5] , a[3]*b[2]+a[4]*b[5]+a[5]*b[8],
            a[6]*b[0]+a[7]*b[3]+a[8]*b[2] , a[6]*b[1]+a[7]*b[4]+a[8]*b[5] , a[6]*b[2]+a[7]*b[5]+a[8]*b[8]
        ]);
    };

/*
 * Computes A*B=RESULT
 * Matrices are column-major wise
 * (Actually the method computes B*A, 
 *  however for the column-major wise 
 *  matrices the parameters can be 
 *  simply swapped.
 *  A * B = ((A * B)^T)^T = (B^T * A^T)^T
 * )
 */
//TODO: fix this mess
CGMath.multMat4 =
    function(b,a,result){
        result.set([
    a[0] *b[0]+a[1] *b[4]+a[2] *b[8]+a[3] *b[12], a[0] *b[1]+a[1] *b[5]+a[2] *b[9]+a[3] *b[13], a[0] *b[2]+a[1] *b[6]+a[2] *b[10]+a[3] *b[14], a[0] *b[3]+a[1] *b[7]+a[2]*b[11]+a[3]*b[15],
    a[4] *b[0]+a[5] *b[4]+a[6] *b[8]+a[7] *b[12], a[4] *b[1]+a[5] *b[5]+a[6] *b[9]+a[7] *b[13], a[4] *b[2]+a[5] *b[6]+a[6] *b[10]+a[7] *b[14], a[4] *b[3]+a[5] *b[7]+a[6]*b[11]+a[7]*b[15],
    a[8] *b[0]+a[9] *b[4]+a[10]*b[8]+a[11]*b[12], a[8] *b[1]+a[9] *b[5]+a[10]*b[9]+a[11]*b[13], a[8] *b[2]+a[9] *b[6]+a[10]*b[10]+a[11]*b[14], a[8] *b[3]+a[9] *b[7]+a[10]*b[11]+a[11]*b[15],
    (a[12]*b[0])+(a[13]*b[4])+(a[14]*b[8])+(a[15]*b[12]), a[12]*b[1]+a[13]*b[5]+a[14]*b[9]+a[15]*b[13], (a[12]*b[2])+(a[13]*b[6])+(a[14]*b[10])+(a[15]*b[14]), a[12]*b[3]+a[13]*b[7]+a[14]*b[11]+a[15]*b[15]
        ]);
    };


CGMath.multMatVec2 =
    function(a,b,result){
        result.set([
            a[0]*b[0]+a[1]*b[1],
            a[2]*b[0]+a[3]*b[1]
        ]);
    };

CGMath.multMatVec3 =
    function(a,b,result){
        result.set([
            a[0]*b[0]+a[3]*b[1]+a[6]*b[2],
            a[1]*b[0]+a[4]*b[1]+a[7]*b[2],
            a[2]*b[0]+a[5]*b[1]+a[8]*b[2]
        ]);
    };

CGMath.multMatVec4 =
    function(a,b,result){
        if(!result.set)
            console.trace();
        result.set([
            a[0]*b[0]+a[4]*b[1]+a[8]*b[2]+a[12]*b[3],
            a[1]*b[0]+a[5]*b[1]+a[9]*b[2]+a[13]*b[3],
            a[2]*b[0]+a[6]*b[1]+a[10]*b[2]+a[14]*b[3],
            a[3]*b[0]+a[7]*b[1]+a[11]*b[2]+a[15]*b[3]
        ]);
    };

CGMath.distVec2 =
    function(a,b){
        var x = b[0]-a[0];
        var y = b[1]-a[1];
        return Math.sqrt(x*x + y*y);
    };

CGMath.distVec3 =
    function(a,b){
        var x = b[0]-a[0];
        var y = b[1]-a[1];
        var z = b[2]-a[2];
        return Math.sqrt(x*x + y*y + z*z);
    };

CGMath.distVec4 =
    function(a,b){
        var x = b[0]-a[0];
        var y = b[1]-a[1];
        var z = b[2]-a[2];
        var w = b[3]-a[3];
        return Math.sqrt(x*x + y*y + z*z + w*w);
    };

CGMath.dirVec2 =
    function(a,b,result){
        var x = b[0]-a[0];
        var y = b[1]-a[1];

        var length = x*x + y*y;
        if(length !== 0){
            var inv = 1 / Math.sqrt(length);
            result[0] = x * inv;
            result[1] = y * inv;
        }
    };

CGMath.dirVec3 =
    function(a,b,result){
        var x = b[0]-a[0];
        var y = b[1]-a[1];
        var z = b[2]-a[2];

        var length = x*x + y*y + z*z;
        if(length !== 0){
            var inv = 1 / Math.sqrt(length);
            result[0] = x * inv;
            result[1] = y * inv;
            result[2] = z * inv;
        }
    };

CGMath.dirVec4 =
    function(a,b,result){
        var x = b[0]-a[0];
        var y = b[1]-a[1];
        var z = b[2]-a[2];
        var w = b[3]-a[3];

        var length = x*x + y*y + z*z + w*w;
        if(length !== 0){
            var inv = 1 / Math.sqrt(length);
            result[0] = x * inv;
            result[1] = y * inv;
            result[2] = z * inv;
            result[3] = w * inv;
        }
    };

CGMath.toDegrees =
    function(angle){
        return angle * 180.0 / Math.PI;
    };

CGMath.toRadians =
    function(angle){
        return angle * Math.PI / 180.0;
    };

CGMath.mat2Str =
    function(mat){
        return CGMath._buffStr(mat, 0, 4, 2);
    };

CGMath.mat3Str =
    function(mat){
        return CGMath._buffStr(mat, 0, 9, 3);
    };

CGMath.mat4Str =
    function(mat){
        return CGMath._buffStr(mat, 0, 16, 4);
    };

CGMath.vec2Str =
    function(vec){
        return CGMath._buffStr(vec, 0, 2, 2);
    };

CGMath.vec3Str =
    function(vec){
        return CGMath._buffStr(vec, 0, 3, 3);
    };

CGMath.vec4Str =
    function(vec){
        return CGMath._buffStr(vec, 0, 4, 4);
    };

CGMath.mod =
    function(a,b){
        if(a<0){
            var c = -a % b;
            return  a+((-a - c)+b);
        }
        else
            return a % b;
    };

CGMath._buffStr =
    function(buff, offset, length, stride){
        var s = "[";
        for(var i=offset; i<length; i=i+stride){
            s = s+"["
            for(var j=0; j<stride; j=j+1){
                s = s+buff[i + j]+",";
            }
            s = s.substring(0, s.length-1)+"]"
        }
        s = s+"]";
        return s;
    };

