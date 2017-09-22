/*
 * Program - manages OpenGL Program Object
 * contains shader and program objects
 * caches attribute and uniform locations
 */
function Program(vsName,fsName){

this._vsName = vsName;

this._fsName = fsName;

this._programId = -1;

this._vertexShaderId = -1;

this._fragmentShaderId = -1;

this._attributeLocations = {};

this._uniformLocations = {};

}

Program.prototype.getProgramId = 
    function(){
        return this._programId;
    };

Program.prototype.getAttributeLocation =
    function(gl, attribName){
        if(attribName in this._attributeLocations)
            return this._attributeLocations[attribName];
        else {
            var location = gl.getAttribLocation(this._programId, attribName);
            this._attributeLocations[attribName] = location;
            return location;
        }
    };

Program.prototype.getUniformLocation =
    function(gl, uniName){
        if(uniName in this._uniformLocations)
            return this._uniformLocations[uniName];
        else {
            var location = gl.getUniformLocation(this._programId, uniName);
            this._uniformLocations[uniName] = location;
            return location;
        }
    };

Program.prototype.getVertexShaderId = 
    function(){
        return this._vertexShaderId;
    };

Program.prototype.getFragmentShaderId =
    function(){
        return this._fragmentShaderId;
    };

Program.prototype.compileProgram =
    function(gl){
        if(this._programId === -1 || this._vertexShaderId === -1 || this._fragmentShaderId === -1)
            return false;
        gl.attachShader(this._programId, this._vertexShaderId);
        gl.attachShader(this._programId, this._fragmentShaderId);
        gl.linkProgram(this._programId);
        gl.validateProgram(this._programId);
        return true;
    };

Program.prototype.createProgram =
    function(gl){
        if(this._programId !== -1){
            this.deleteProgram(gl, this._programId);
            this._programId = -1;
        }
        this._programId = gl.createProgram();
        return !(this._programId === -1);
    };

Program.prototype.setVertexShader =
    function(gl, shaderSource){
        if(this._vertexShaderId !== -1){
            this.deleteShader(gl, this._vertexShaderId);
            this._vertexShaderId = -1;
        }
        this._vertexShaderId = this.createAndCompileShader(gl, shaderSource , gl.VERTEX_SHADER);
        return !(this._vertexShaderId === -1);
    };

Program.prototype.setFragmentShader =
    function(gl, shaderSource){
        if(this._fragmentShaderId !== -1){
            this.deleteShader(gl, this._fragmentShaderId);
            this._fragmentShaderId = -1;
        }
        this._fragmentShaderId = this.createAndCompileShader(gl, shaderSource , gl.FRAGMENT_SHADER);
        return !(this._fragmentShaderId === -1);
    };

Program.prototype.deleteProgram =
    function(gl, programId){
        gl.deleteProgram(programId);
    };

Program.prototype.deleteShader =
    function(gl, shaderId){
        gl.deleteShader(shaderId);
    };

Program.prototype.loadSourceCode =
    function(filePath, callback, errorCallback){
        
        // Set up an asynchronous request
        var request = new XMLHttpRequest();
        request.open('GET', filePath, true);

        // Hook the event that gets called as the request progresses
        request.onreadystatechange = function () {
            // If the request is "DONE" (completed or failed)
            if (request.readyState == 4) {
                // If we got HTTP status 200 (OK)
                if (request.status == 200) {
                    callback(request.responseText, data)
                } else { // Failed
                    errorCallback(url);
                }
            }
        };

        request.send(null);
    };

Program.prototype.createAndCompileShader =
    function(gl, shaderSource , shaderType){
        var error = false;
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);
        var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(! (status === true)){
            if(shaderType === gl.FRAGMENT_SHADER)
                console.log('shader compilation failed: '+this._fsName);
            else if(shaderType === gl.VERTEX_SHADER)
                console.log('shader compilation failed: '+this._vsName);
            else   
                console.log("shader compilation failed: some shader");
            var log = gl.getShaderInfoLog(shader);
            console.log(log);
            error = true;
        } else {
            /*
            if(shaderType === gl.FRAGMENT_SHADER)
                console.log('shader compiled: '+this._fsName);
            else if(shaderType === gl.VERTEX_SHADER)
                console.log('shader compiled: '+this._vsName);
            else
                console.log("shader compiled: some shader");
            */
        }

        if(error == true){
            gl.deleteShader(shader);
            shader = -1;
        }
        return shader;
    };

Program.prototype.dispose =
    function(gl){
        if(this._programId !== -1){
            gl.deleteProgram(this._programId);
            this._programId = -1;
        }
        if(this._vertexShaderId !== -1){
            gl.deleteShader(this._vertexShaderId);
            this._vertexShaderId = -1;
        }
        if(this._fragmentShaderId !== -1){
            gl.deleteShader(this._fragmentShaderId);
            this._fragmentShaderId = -1;
        }
    };

Program.createAndCompileProgram =
    function(gl, vertexShader, fragmentShader){
        var program = new Program(vertexShader, fragmentShader);
        var programReady = true;
            programReady = programReady & program.createProgram(gl);
            programReady = programReady & program.setVertexShader(gl, gl.res.getRessource(vertexShader));
            programReady = programReady & program.setFragmentShader(gl, gl.res.getRessource(fragmentShader));
            programReady = programReady & program.compileProgram(gl);
        if(!programReady){
            console.log('creating shader with '+vertexShader+' and '+fragmentShader+' failed.');
        }
        return program;
    };
