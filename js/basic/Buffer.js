/*
 * Buffer - buffers data for OpenGL Buffers
 * allows to incrementally add data by keeping track of size
 * manages OpenGL Buffer
 */
function Buffer(name){

// optional name for debug purposes
this._name = name;

// local buffer
this._buffer = new Float32Array(128);
this._buffer_pos = 0;

// OpenGL Buffer Object
this._buffer_bo = -1;

// true if OpenGL Buffer Object was created
this._initiated = false;

// true if data in local buffer was changed and
// needs to be transferred to OpenGL Buffer
this._needTransfer = false;

}

Buffer.prototype.isInitiated =
    function(){
        return this._initiated;
    };

Buffer.prototype.transfer =
    function(gl){

        if(!this._needTransfer)
            return;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer_bo);
        gl.bufferData(gl.ARRAY_BUFFER, this._buffer.subarray(0, this._buffer_pos), gl.DYNAMIC_DRAW);

        this._needTransfer = false;
        
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

Buffer.prototype.print =
    function(){
        console.log("buffer: "+this._name+" "+CGMath._buffStr(this._buffer, 0, this._buffer_pos, 7));
    };

Buffer.prototype.clear = 
    function(){
        this._buffer_pos = 0;
        this._needTransfer = true;
    };

Buffer.prototype._enlargeBuffer =
    function(buffer, min){
        var newSize = buffer.length * 2;
        while(newSize < min)
            newSize = newSize * 2;
        var newBuffer = new Float32Array(newSize);
        newBuffer.set(buffer);
        return newBuffer;
    };

Buffer.prototype._reduceBuffer =
    function(buffer, position){
        var newSize = buffer.length / 2;

        while(newSize/2 >= position)
            newSize = newSize / 2;
        if(newSize >= position){
            var newBuffer = new Float32Array(newSize);
            newBuffer.set(buffer.subarray(0,position));
        }
        return buffer;
    };

Buffer.prototype.concat =
    function(points, length){
        if( length > this._buffer.length - this._buffer_pos)
            this._buffer = this._enlargeBuffer(this._buffer, this._buffer_pos + length);
        this._buffer.set(points.slice(0,length),this._buffer_pos);
        this._buffer_pos = this._buffer_pos + length;
        this._needTransfer = true;
    };

Buffer.prototype.init =
    function(gl){
        if(this._initiated === true)
            return;
        this._buffer_bo = gl.createBuffer();

        this._initiated = true;
    };

Buffer.prototype.bind =
    function(gl){
        if(this._needTransfer)
            this.transfer(gl);
            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer_bo);
    };

Buffer.prototype.unbind =
    function(gl){
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };

Buffer.prototype.draw =
    function(gl, mode, quotient){
            gl.drawArrays(mode, 0, this._buffer_pos / quotient);
    };

Buffer.prototype.dispose =
    function(gl){
        delete this._buffer;
        gl.deleteBuffer(this._buffer_bo);
        this._buffer_bo = -1;
        this._initiated = false;
    };

