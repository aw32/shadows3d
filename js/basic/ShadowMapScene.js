/*
 * ShadowMapScene - scene rendering example shadow map scene
 */
function ShadowMapScene(){

BasicScene.call(this);

this._eventQueue = [];

this._clearColor = new Color(0.5, 0.4, 0.4, 1.0);

this._resetShadowMapColor = new Color(1.0,1.0,1.0,1.0);

this._ressourceList = [
        ["data", "normal.vs", "shadersm/normal.vs"],
        ["data", "normal.fs", "shadersm/normal.fs"],
        ["data", "createSMColor.vs", "shadersm/createSMColor.vs"],
        ["data", "createSMColor.fs", "shadersm/createSMColor.fs"],
        ["data", "createSM.vs", "shadersm/createSM.vs"],
        ["data", "createSM.fs", "shadersm/createSM.fs"],
        ["data", "depthToColor.vs", "shadersm/depthToColor.vs"],
        ["data", "depthToColor.fs", "shadersm/depthToColor.fs"],
        ["data", "colorToColor.vs", "shadersm/colorToColor.vs"],
        ["data", "colorToColor.fs", "shadersm/colorToColor.fs"],
        ["data", "renderShadowed.vs", "shadersm/renderShadowed.vs"],
        ["data", "renderShadowed.fs", "shadersm/renderShadowed.fs"],
        ["data", "renderShadowedColor.vs", "shadersm/renderShadowedColor.vs"],
        ["data", "renderShadowedColor.fs", "shadersm/renderShadowedColor.fs"]
    ];

this._shadowMapResolution = 4096;
this._shadowMapBias = 0.0006;

this._getSMCallback = null;

this._getTexCallback = null;

this._getScreenshotCallback = null;

this._screenshotResolution = 1;

this._depthAvailable = false;

this._shadowMapType = "depth"; // color or depth

this._drawSM = false;

}

ShadowMapScene.prototype = new BasicScene();
ShadowMapScene.prototype.constructor = ShadowMapScene;


ShadowMapScene.prototype.init =
    function(eventFifo, width, height, gl){

        this._width = width;
        this._height = height;

        this.depthTexture = gl.getExtension('WEBGL_depth_texture');
        this.textureFloat = gl.getExtension('OES_texture_float');
        if(this.depthTexture !== null && this.depthTexture !== undefined && this.textureFloat !== null
            && this.textureFloat !== undefined)
                this._depthAvailable = true;

        this._eventQueue = eventFifo;
                
        // define cube with colors
        this._cube = [];
        var t=[-0.5,-0.5,0.5];
        this._cube = this._cube.concat(this.createQuad(
            [0,0,0],[0,0,-1],[1,0,0],[1,0,-1],
            new Color(1,1,0,1),t[0],t[1],t[2]));
        this._cube = this._cube.concat(this.createQuad(
            [1,0,0],[1,0,-1],[1,1,0],[1,1,-1],
            new Color(0,0,1,1),t[0],t[1],t[2]));
        this._cube = this._cube.concat(this.createQuad(
            [1,1,0],[1,1,-1],[0,1,0],[0,1,-1],
            new Color(0,1,0,1),t[0],t[1],t[2]));
        this._cube = this._cube.concat(this.createQuad(
            [0,1,0],[0,1,-1],[0,0,0],[0,0,-1],
            new Color(1,0,0,1),t[0],t[1],t[2]));
        this._cube = this._cube.concat(this.createQuad(
            [0,0,-1],[0,1,-1],[1,0,-1],[1,1,-1],
            new Color(0,1,1,1),t[0],t[1],t[2]));
        this._cube = this._cube.concat(this.createQuad(
            [0,1,0],[0,0,0],[1,1,0],[1,0,0],
            new Color(1,0,1,1),t[0],t[1],t[2]));
        this._buffer_cube = new Buffer("cube");
        this._buffer_cube.init(gl);
        this._buffer_cube.concat(this._cube, this._cube.length );
        

        this._ground = this.createQuad(
            [3,0,-3],[-3,0,-3],[3,0,3],[-3,0,3],
            new Color(0.7,0.7,0.7,1),0,-0.50001,0);
        this._buffer_ground = new Buffer("ground");
        this._buffer_ground.init(gl);
        this._buffer_ground.concat(this._ground, this._ground.length);

        this._light = [];
        this._light = this._light.concat(this.createQuad(
            [-0.3,0,0],[0,0,-0.3],[0,0,0.3],[0.3,0,0],
            new Color(1,1,1,1),2,2,-1 ));
        this._light = this._light.concat(this.createQuad(
            [-0.3,0,0],[0,-0.3,0],[0,0.3,0],[0.3,0,0],
            new Color(1,1,1,1),2,2,-1 ));
        this._light = this._light.concat(this.createQuad(
            [0,0,-0.3],[0,-0.3,0],[0,0.3,0],[0,0,0.3],
            new Color(1,1,1,1),2,2,-1 ));
        this._buffer_light = new Buffer("light");
        this._buffer_light.init(gl);
        this._buffer_light.concat(this._light, this._light.length);

        this.initCameras(gl);

        this.initPrograms(gl);

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LESS);
        gl.depthRange(0,1); 
      
        this._changeMap = false; 
        this._sm_fb = null;
        this._sm_tx = null;
        this._sm_rb = null;
        this.initShadowMap(gl);
        window.document.title = "Shadow Map";
        if(this._depthAvailable == false)
            window.document.title = window.document.title + " Extensions WEBGL_depth_texture and/or OES_texture_float missing!";
    };

ShadowMapScene.prototype.initPrograms = 
    function(gl){
        this._programNormal = Program.createAndCompileProgram(gl, 'normal.vs', 'normal.fs');
        this._programShadowed = Program.createAndCompileProgram(gl, 'renderShadowed.vs', 'renderShadowed.fs');
        this._programCreateSM = Program.createAndCompileProgram(gl, 'createSM.vs', 'createSM.fs');
        this._programDepthToColor = Program.createAndCompileProgram(gl, 'depthToColor.vs', 'depthToColor.fs');
        this._programColorToColor = Program.createAndCompileProgram(gl, 'colorToColor.vs', 'colorToColor.fs');
        this._programCreateSMColor = Program.createAndCompileProgram(gl, 'createSMColor.vs', 'createSMColor.fs');
        this._programShadowedColor = Program.createAndCompileProgram(gl, 'renderShadowedColor.vs', 'renderShadowedColor.fs');
    };

ShadowMapScene.prototype.initCameras =
    function(gl){
        this._camera = new Camera();
        this._camera.init(this._width, this._height);
        this._view = new OrbitCamera();
        this._camera.setView(this._view);
        this._camera.update(true,true);

        this._light_camera = new Camera();
        this._light_camera.init(this._width, this._height);
        this._light_camera.setView(new LightCamera());
        this._light_camera.position(2,2,-1);
        this._light_camera.lookat(0,0,0);
        this._light_camera.update(true,true);

    };

ShadowMapScene.prototype.initShadowMap =
    function(gl){

        var sm_res = this._shadowMapResolution;

        if(this._sm_fb === null)
            this._sm_fb = gl.createFramebuffer();
        
        if(this._sm_tx === null) {
            this._sm_tx = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this._sm_tx);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        
        if(this._sm_rb === null){
            this._sm_rb = gl.createRenderbuffer();
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._sm_fb);

        if(this._shadowMapType === "color"){
            gl.bindRenderbuffer(gl.RENDERBUFFER, this._sm_rb);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, sm_res, sm_res);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, sm_res, sm_res, 0, gl.RGBA, gl.UNSIGNED_BYTE, null );
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._sm_tx, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._sm_rb);
        } else
        if(this._shadowMapType === "depth"){
            gl.bindTexture(gl.TEXTURE_2D, this._sm_tx);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, sm_res, sm_res, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null );
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._sm_tx, 0);
        }

        var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if(status !== gl.FRAMEBUFFER_COMPLETE)
            console.log("framebuffer broken!");

        this._shadowMapRendered = false;
        this._changeMap = false;

    };

ShadowMapScene.prototype.changeRes = 
    function(newRes){
        var res = [64,128,256,512,1024,2048,4096];
        if(newRes<0 || newRes>6)
            return;
        newRes = res[newRes];

        if(newRes != this._shadowMapResolution) {

            this._shadowMapResolution = newRes;
            this._changeMap = true;
        }
    };

ShadowMapScene.prototype.changeBias =
    function(newBias){
        if(newBias<-0.0005 || newBias>0.01)
            return;
        this._shadowMapBias = newBias;
    };

ShadowMapScene.prototype.changeView =
    function(view){
        if(view == 0){
            this._view = new OrbitCamera();
            this._camera.setView(this._view);
            this._camera.update(true,true);
        }
        else {
            this._view = new FreeCamera();
            this._camera.setView(this._view);
            this._camera.update(true,true);
        }
    };

ShadowMapScene.prototype.changeType =
    function(type){
        if(type === "color" || type === "depth") {
            this._shadowMapType = type;
            this._changeMap = true;
        }
    };

ShadowMapScene.prototype.drawSM =
    function(val){
        if(val === true)
            this._drawSM = true;
        if(val === false)
            this._drawSM = false;
    };

ShadowMapScene.prototype.getTex =
    function(callback){
        this._getTexCallback = callback;
    };

ShadowMapScene.prototype._returnSM =
    function(gl){
        if(this._shadowMapType === "color"){
            var buf = new Uint8Array(this._shadowMapResolution * this._shadowMapResolution * 4);
        
            var tex = this.copyDepthToColor(gl);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            gl.readPixels(0, 0, this._shadowMapResolution, this._shadowMapResolution, gl.RGBA, gl.UNSIGNED_BYTE, buf);
            gl.deleteTexture(tex);
            gl.deleteFramebuffer(fb);

            // flip image vertically
            var buf2 = new Uint8Array(this._shadowMapResolution*this._shadowMapResolution * 4);
            var col = 0;
            for(var row = 0; row < this._shadowMapResolution; row++)
                for(col = 0; col < this._shadowMapResolution*4; col++)
                    buf2[row*this._shadowMapResolution*4+col] =
                        buf[(this._shadowMapResolution-row-1)*this._shadowMapResolution*4+col];
            buf = buf2;

            // Create a 2D canvas to store the result 
            var canvas = document.createElement('canvas');
            canvas.width = this._shadowMapResolution;
            canvas.height = this._shadowMapResolution;
            var context = canvas.getContext('2d');

            // Copy the pixels to a 2D canvas
            var imageData = context.createImageData(this._shadowMapResolution,this._shadowMapResolution);
            imageData.data.set(buf);
            context.putImageData(imageData, 0, 0);
            var call = this._getSMCallback.bind(window,canvas.toDataURL());
            this._getSMCallback = null;
            setTimeout(call, 50);
        } else {
            var buf = new Uint8Array(this._shadowMapResolution * this._shadowMapResolution * 4);
            var tex = this.copyDepthToColor(gl);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            gl.readPixels(0, 0, this._shadowMapResolution, this._shadowMapResolution, gl.RGBA, gl.UNSIGNED_BYTE, buf);
            gl.deleteTexture(tex);
            gl.deleteFramebuffer(fb);

            // flip image vertically
            var buf2 = new Uint8Array(this._shadowMapResolution*this._shadowMapResolution * 4);
            var col = 0;
            for(var row = 0; row < this._shadowMapResolution; row++)
                for(col = 0; col < this._shadowMapResolution*4; col++)
                    buf2[row*this._shadowMapResolution*4+col] =
                        buf[(this._shadowMapResolution-row-1)*this._shadowMapResolution*4+col];
            buf = buf2;
    
            var canvas = document.createElement('canvas');
            canvas.width = this._shadowMapResolution;
            canvas.height = this._shadowMapResolution;
            var context = canvas.getContext('2d');

            // Copy the pixels to a 2D canvas
            var imageData = context.createImageData(this._shadowMapResolution,this._shadowMapResolution);
            imageData.data.set(buf);
            context.putImageData(imageData, 0, 0);
            var call = this._getSMCallback.bind(window,canvas.toDataURL());
            this._getSMCallback = null;
            setTimeout(call, 50);
        }
    };

ShadowMapScene.prototype.getSM =
    function(callback){
        this._getSMCallback = callback;
    };

ShadowMapScene.prototype._returnTex =
    function(gl){
        if(this._shadowMapType === "color"){
        var buf = new Uint8Array(this._shadowMapResolution * this._shadowMapResolution * 4);
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._sm_tx, 0);
        gl.readPixels(0, 0, this._shadowMapResolution, this._shadowMapResolution, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        gl.deleteFramebuffer(fb);

        // flip image vertically
        var buf2 = new Uint8Array(this._shadowMapResolution*this._shadowMapResolution * 4);
        var col = 0;
        for(var row = 0; row < this._shadowMapResolution; row++)
            for(col = 0; col < this._shadowMapResolution*4; col++)
                buf2[row*this._shadowMapResolution*4+col] =
                buf[(this._shadowMapResolution-row-1)*this._shadowMapResolution*4+col];
        buf = buf2;

        // Create a 2D canvas to store the result 
        var canvas = document.createElement('canvas');
        canvas.width = this._shadowMapResolution;
        canvas.height = this._shadowMapResolution;
        var context = canvas.getContext('2d');

        // Copy the pixels to a 2D canvas
        var imageData = context.createImageData(this._shadowMapResolution,this._shadowMapResolution);
        imageData.data.set(buf);
        context.putImageData(imageData, 0, 0);
        var call = this._getTexCallback.bind(window,canvas.toDataURL());
        this._getTexCallback = null;
        setTimeout(call, 50);
        } else {
            var buf = new Uint8Array(this._shadowMapResolution * this._shadowMapResolution * 4);
            var tex = this.copyDepthToColor(gl);

            var fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
            gl.readPixels(0, 0, this._shadowMapResolution, this._shadowMapResolution, gl.RGBA, gl.UNSIGNED_BYTE, buf);
            gl.deleteTexture(tex);
            gl.deleteFramebuffer(fb);

        // flip image vertically
        var buf2 = new Uint8Array(this._shadowMapResolution*this._shadowMapResolution * 4);
        var col = 0;
        for(var row = 0; row < this._shadowMapResolution; row++)
            for(col = 0; col < this._shadowMapResolution*4; col++)
                buf2[row*this._shadowMapResolution*4+col] =
                buf[(this._shadowMapResolution-row-1)*this._shadowMapResolution*4+col];
        buf = buf2;

        var canvas = document.createElement('canvas');
        canvas.width = this._shadowMapResolution;
        canvas.height = this._shadowMapResolution;
        var context = canvas.getContext('2d');

        // Copy the pixels to a 2D canvas
        var imageData = context.createImageData(this._shadowMapResolution,this._shadowMapResolution);
        imageData.data.set(buf);
        context.putImageData(imageData, 0, 0);
        var call = this._getTexCallback.bind(window,canvas.toDataURL());
        this._getTexCallback = null;
        setTimeout(call, 50);
        }

    };

ShadowMapScene.prototype.getScreenshot =
    function(callback, size){
        var val = parseInt(size, 10);
        if( val>=0 && val<=4)
            this._screenshotResolution = val;
        this._getScreenshotCallback = callback;
    };

ShadowMapScene.prototype._returnScreenshot =
    function(gl){
        console.log("screenshot size: "+this._screenshotResolution*this._width+"x"+this._screenshotResolution*this._height);
        var buf = new Uint8Array(this._width*this._screenshotResolution*this._height*this._screenshotResolution * 4);
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        var rb = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, this._width*this._screenshotResolution, this._height*this._screenshotResolution);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);

        var rbd = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbd);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._width*this._screenshotResolution, this._height*this._screenshotResolution);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbd);

        // render scene
        gl.viewport(0,0,this._width*this._screenshotResolution, this._height*this._screenshotResolution);

        gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.renderShadowed(gl);


        gl.readPixels(0, 0, this._width*this._screenshotResolution, this._height*this._screenshotResolution, gl.RGBA, gl.UNSIGNED_BYTE, buf);
        gl.deleteRenderbuffer(rb);
        gl.deleteRenderbuffer(rbd);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.deleteFramebuffer(fb);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // flip image vertically
        var buf2 = new Uint8Array(this._width*this._screenshotResolution*this._height*this._screenshotResolution * 4);
        var col = 0;
        for(var row = 0; row < this._height*this._screenshotResolution; row++)
            for(col = 0; col < this._width*this._screenshotResolution*4; col++)
                buf2[row*this._width*this._screenshotResolution*4+col] = 
                buf[(this._height*this._screenshotResolution-row-1)*this._width*this._screenshotResolution*4+col];
        buf = buf2;

        var canvas = document.createElement('canvas');
        canvas.width = this._width*this._screenshotResolution;
        canvas.height = this._height*this._screenshotResolution;
        var context = canvas.getContext('2d');

        // Copy the pixels to a 2D canvas
        var imageData = context.createImageData(this._width*this._screenshotResolution, this._height*this._screenshotResolution);
        imageData.data.set(buf);
        context.putImageData(imageData, 0, 0);


        var call = this._getScreenshotCallback.bind(window,canvas.toDataURL());
        this._getScreenshotCallback = null;
        setTimeout(call, 50);
    };

// Render texture to frame
ShadowMapScene.prototype.copyDepthToColor =
    function(gl){
        var buffer = new Buffer("texquad");
        buffer.init(gl);
        buffer.concat([-1,-1, 1,-1, -1,1, 1,1], 8);

        if(this._shadowMapType === "depth")
            var program = this._programDepthToColor;
        else
            var program = this._programColorToColor;


        gl.useProgram(program.getProgramId());

        var tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._shadowMapResolution, this._shadowMapResolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        
        var rb = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._shadowMapResolution, this._shadowMapResolution);

        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

        gl.activeTexture(gl.TEXTURE0);
        
        gl.bindTexture(gl.TEXTURE_2D, this._sm_tx);
        
        var positionAttrib = program.getAttributeLocation(gl, "vertexPosition");
      
        gl.viewport(0,0,this._shadowMapResolution, this._shadowMapResolution);
 
        // clear
        gl.clearColor(0.0,1.0,0.0,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);


        // draw
        buffer.bind(gl);

        gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(positionAttrib);

        buffer.draw(gl, gl.TRIANGLE_STRIP, 2);

        gl.disableVertexAttribArray(positionAttrib);
        buffer.unbind(gl);       

 
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(fb);
        gl.deleteRenderbuffer(rb);
        gl.useProgram(null);
        buffer.dispose(gl);
        return tex;
    };

ShadowMapScene.prototype.getCamera =
    function(){
        return JSON.stringify(this._camera._currentView);
    };

ShadowMapScene.prototype.setCamera =
    function(str){
        var view = JSON.parse(str);
        if(view._type === 'orbit'){
            this._view = new OrbitCamera();
            this._view.fromJSON(view);
            this._camera.setView(this._view);
            this._camera.update(true,true);
        } else
        if(view._type === 'free'){
            this._view = new FreeCamera();
            this._view.fromJSON(view);
            this._camera.setView(this._view);
            this._camera.update(true,true);   
        }
    };

ShadowMapScene.prototype.renderShadowMap =
    function(gl){

        var program;
        if(this._shadowMapType === "color"){
            program = this._programCreateSMColor;
        } else 
        if(this._shadowMapType === "depth"){
            program = this._programCreateSM;
        }

        var sm_res = this._shadowMapResolution;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._sm_fb);
        gl.viewport(0,0,sm_res,sm_res);
        gl.useProgram(program.getProgramId());

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._sm_tx);

        if(this._shadowMapType === "color"){
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._sm_tx, 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._sm_rb);
        } 
        /*else {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this._sm_tx, 0);
            //gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, null);
        }*/




        this._light_camera.updateUniform(gl, program.getUniformLocation(gl,'pmvMatrix'))
        var positionAttributeLocation = program.getAttributeLocation(gl,'vertexPosition');



        if(this._shadowMapType === "color"){
            gl.clearColor(this._resetShadowMapColor.r, this._resetShadowMapColor.g, this._resetShadowMapColor.b, this._resetShadowMapColor.a);
            gl.clear(gl.COLOR_BUFFER_BIT);
        } else {
            //gl.clearColor(this._resetShadowMapColor.r, this._resetShadowMapColor.g, this._resetShadowMapColor.b, this._resetShadowMapColor.a);
            //gl.clear(gl.DEPTH_BUFFER_BIT);
        }

        this.renderBuffer(gl, this._buffer_ground, positionAttributeLocation, null);
        this.renderBuffer(gl, this._buffer_cube, positionAttributeLocation, null);

        gl.useProgram(null);

        // prepare mvp matrix
        this._sm_mvp = new Float32Array(16);
        var scale = new Float32Array(16);
        scale.set([0.5, 0.0, 0.0, 0.0,
                   0.0, 0.5, 0.0, 0.0,
                   0.0, 0.0, 0.5, 0.0,
                   0.5, 0.5, 0.5, 1.0]);
        CGMath.multMat4(scale, this._light_camera._pmvMat, this._sm_mvp);

        this._shadowMapRendered = true;
    };


ShadowMapScene.prototype.display =
    function(gl) {
                
        while(this._eventQueue.length>0)
            this.consumeEvent(this._eventQueue.splice(0,1)[0]);
       
        if(this._changeMap === true)
            this.initShadowMap(gl);

        if(this._shadowMapRendered === false)
            this.renderShadowMap(gl);

        if(this._getSMCallback!=null)
            this._returnSM(gl);

        if(this._getTexCallback!=null)
            this._returnTex(gl);

        if(this._getScreenshotCallback!=null)
            this._returnScreenshot(gl);

        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
       
        gl.viewport(0,0,this._width,this._height);

        gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
        gl.clear(gl.COLOR_BUFFER_BIT);

            this.renderShadowed(gl);
    };

ShadowMapScene.prototype.renderShadowed =
    function(gl){
       
        var program;

        if(this._shadowMapType === "color"){
            program = this._programShadowedColor;
        } else {
            program = this._programShadowed;
        }
 
        gl.useProgram(program.getProgramId());
        
        gl.uniformMatrix4fv(program.getUniformLocation(gl,'lightPmvMatrix'), false, this._sm_mvp);

        this._camera.updateUniform(gl, program.getUniformLocation(gl,'pmvMatrix'));

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._sm_tx);
        gl.uniform1i(program.getUniformLocation(gl,'shadowMap'), 0); 
        if(this._drawSM === true)
            gl.uniform1i(program.getUniformLocation(gl,'drawSM'), 1); 
        else
            gl.uniform1i(program.getUniformLocation(gl,'drawSM'), 0); 
        gl.uniform1f(program.getUniformLocation(gl,'bias'), this._shadowMapBias); 

        var positionAttributeLocation = program.getAttributeLocation(gl,'vertexPosition');
        var colorAttributeLocation = program.getAttributeLocation(gl,'vertexColor');

        this.renderBuffer(gl, this._buffer_cube, positionAttributeLocation, colorAttributeLocation);
        
        this.renderBuffer(gl, this._buffer_ground, positionAttributeLocation, colorAttributeLocation);

        this.renderBuffer(gl, this._buffer_light, positionAttributeLocation, colorAttributeLocation);

        gl.useProgram(null);
    };

ShadowMapScene.prototype.renderBuffer =
    function(gl, buffer, positionAttrib, colorAttrib){
        buffer.bind(gl);

        if(positionAttrib !== null){
            gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, gl.FALSE, 7 * 4, 0);
            gl.enableVertexAttribArray(positionAttrib);
        }
        if(colorAttrib !== null){
            gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, gl.FALSE, 7 * 4, 3 * 4);
            gl.enableVertexAttribArray(colorAttrib);
        }

        buffer.draw(gl, gl.TRIANGLES, 7);

        if(positionAttrib !== null)
            gl.disableVertexAttribArray(positionAttrib);
        if(colorAttrib !== null)
            gl.disableVertexAttribArray(colorAttrib);
        buffer.unbind(gl);
    };

ShadowMapScene.prototype.renderNormal =
    function(gl){

        gl.useProgram(this._programNormal.getProgramId());

        this._camera.updateUniform(gl, this._programNormal.getUniformLocation(gl,'pmvMatrix'));

        var positionAttributeLocation = this._programNormal.getAttributeLocation(gl,'vertexPosition');
        var colorAttributeLocation = this._programNormal.getAttributeLocation(gl,'vertexColor');

        this.renderBuffer(gl, this._buffer_cube, positionAttributeLocation, colorAttributeLocation);
        
        this.renderBuffer(gl, this._buffer_ground, positionAttributeLocation, colorAttributeLocation);

        this.renderBuffer(gl, this._buffer_light, positionAttributeLocation, colorAttributeLocation);

        gl.useProgram(null);
    };

ShadowMapScene.prototype.destroy =
    function(gl) {
        this._programNormal.dispose(gl);
        this._buffer_cube.dispose(gl);
        this._buffer_ground.dispose(gl);
        this._buffer_light.dispose(gl);
    };

ShadowMapScene.prototype.reshape =
    function(gl, width, height) {
        BasicScene.prototype.reshape.call(this, gl, width, height); 

        this._camera.reshape(gl, width, height);
        this._camera.update(false, true);
    };

ShadowMapScene.prototype.consumeEvent =
    function(e) {
        
        this._view.consumeEvent(e, this._camera);
        this._camera.update(true,false); 
                
        return false;
    };

ShadowMapScene.prototype.createQuad =
    function(a,b,c,d, color,x,y,z){
        return            [
                a[0]+x,a[1]+y,a[2]+z, color.r, color.g, color.b, color.a,
                b[0]+x,b[1]+y,b[2]+z, color.r, color.g, color.b, color.a,
                c[0]+x,c[1]+y,c[2]+z, color.r, color.g, color.b, color.a,
                
                c[0]+x,c[1]+y,c[2]+z, color.r, color.g, color.b, color.a,
                b[0]+x,b[1]+y,b[2]+z, color.r, color.g, color.b, color.a,
                d[0]+x,d[1]+y,d[2]+z, color.r, color.g, color.b, color.a
            ];
    };

