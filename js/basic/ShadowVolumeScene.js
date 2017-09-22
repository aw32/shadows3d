/*
 * ShadowVolumeScene - scene rendering example shadow volume scene
 */
function ShadowVolumeScene(){

BasicScene.call(this);


this._eventQueue = [];

this._clearColor = new Color(0.5, 0.4, 0.4, 1.0);

this._ressourceList = [
        ["data", "normal.vs", "shadersv/normal.vs"],
        ["data", "normal.fs", "shadersv/normal.fs"],
        ["data", "shadow.vs", "shadersv/shadow.vs"],
        ["data", "shadow.fs", "shadersv/shadow.fs"],
        ["data", "pass.vs", "shadersv/pass.vs"],
        ["data", "pass.fs", "shadersv/pass.fs"],
        ["data", "pass.vs", "shadersv/pass.vs"],
        ["data", "pass.fs", "shadersv/pass.fs"],
        ["data", "fail.vs", "shadersv/fail.vs"],
        ["data", "fail.fs", "shadersv/fail.fs"],
        ["data", "lineFail.vs", "shadersv/lineFail.vs"],
        ["data", "lineFail.fs", "shadersv/lineFail.fs"],
        ["data", "line.vs", "shadersv/line.vs"],
        ["data", "line.fs", "shadersv/line.fs"]
        ];

this.lightPos = [0.75,3,0];
//this.lightPos = [0.5,1.7,0];
//this.lightPos = [0.75,2.2,0.1];
this.lightLookAt = [0,0,0];

this.objOnePos = [0.5,2,-0.75];
this.objTwoPos = [0.8,2,0.3];
//this.objOnePos = [0.5,1,-0.75];
//this.objTwoPos = [0.8,1,0.3];
//this.objTwoPos = [0.8,1,0.3];

this.volumeOne;
this.volumeTwo;

this.volumeOneColor = [0.2,1,0.2,0.2];
this.volumeTwoColor = [0.2,0.2,1,0.2];

this.volumeOneEdgeColor = [0.2,1,0.2,1];
this.volumeTwoEdgeColor = [0.2,0.2,1,1];

this.type = "pass";
this.extrusionFactor = 100.0;

this.drawObjects = true;
this.drawEdges = true;
this.drawVolume = true;
this.drawShadow = true;
this.edgesOnTop = false;

this._getScreenshotCallback = null;

this._screenshotResolution = 1;

}

ShadowVolumeScene.prototype = new BasicScene();
ShadowVolumeScene.prototype.constructor = ShadowVolumeScene;

ShadowVolumeScene.prototype.init =
    function(eventFifo, width, height, gl){

        this._width = width;
        this._height = height;

        this._eventQueue = eventFifo;

        this._ground = this.createQuad(
            [5,0,-5],[-5,0,-5],[5,0,5],[-5,0,5],
            new Color(0.7,0.7,0.7,1),0,-0.50001,0);
        this._buffer_ground = new Buffer("ground");
        this._buffer_ground.init(gl);
        this._buffer_ground.concat(this._ground, this._ground.length);

        this._light = [];
        this._light = this._light.concat(this.createQuad(
            [-0.3,0,0],[0,0,-0.3],[0,0,0.3],[0.3,0,0],
            new Color(1,1,1,1),this.lightPos[0],this.lightPos[1],this.lightPos[2] ));
        this._light = this._light.concat(this.createQuad(
            [-0.3,0,0],[0,-0.3,0],[0,0.3,0],[0.3,0,0],
            new Color(1,1,1,1),this.lightPos[0],this.lightPos[1],this.lightPos[2] ));
        this._light = this._light.concat(this.createQuad(
            [0,0,-0.3],[0,-0.3,0],[0,0.3,0],[0,0,0.3],
            new Color(1,1,1,1),this.lightPos[0],this.lightPos[1],this.lightPos[2] ));
        this._buffer_light = new Buffer("light");
        this._buffer_light.init(gl);
        this._buffer_light.concat(this._light, this._light.length);

        this.initPrograms(gl);

        this.initCameras(gl);

        var lineColor = [1.0,1.0,0.0,1.0];

        // debug cross
        this._buffer_cross = new Buffer("cross");
        this._buffer_cross.init(gl);
        this._buffer_cross.concat([
            2,0,0, 1,0,0,1, 3,0,0, 1,0,0,1,
            2,0,0, 0,1,0,1, 2,1,0, 0,1,0,1,
            2,0,0, 0,0,1,1, 2,0,1, 0,0,1,1],56);

        var objOne = this.createRhomb(this.objOnePos,[0.1,0,0.5],[0,0.3,0],[0.3,0,-0.1],new Color(0.2,1,0.2,1));
        this._buffer_objOne = new Buffer("objOne")
        this._buffer_objOne.init(gl);
        this._buffer_objOne.concat(objOne, objOne.length);
        var objOneWithoutColor = this.removeColor(objOne);
        this.volumeOne = new ShadowVolume();
        this.volumeOne.silhouette = this.volumeOne.computeSilhouette(objOneWithoutColor, this.lightPos);
        this.volumeOne._buffer_quads_pass = new Buffer("objOneQuadsPass")
        this.volumeOne._buffer_quads_pass.init(gl);
        this.volumeOne.createQuadsE(this.volumeOne.silhouette.edges, this.lightPos, this.extrusionFactor, this.volumeOne._buffer_quads_pass);
        this.volumeOne._buffer_quads_fail = new Buffer("objOneQuadsFail")
        this.volumeOne._buffer_quads_fail.init(gl);
        this.volumeOne.createQuads(this.volumeOne.silhouette, this.lightPos, this.volumeOne._buffer_quads_fail);
        this.volumeOne.silhouetteBuffer = this.volumeOne.edgesToBuffer(this.volumeOne.silhouette.edges, lineColor);

        this.volumeOne._buffer_silhouette = new Buffer("objOneSilhouette");
        this.volumeOne._buffer_silhouette.init(gl);
        this.volumeOne._buffer_silhouette.concat(this.volumeOne.silhouetteBuffer, this.volumeOne.silhouette.edges.length*14);

        this.volumeOne._buffer_edges_pass = new Buffer("objOneEdgesPass");
        this.volumeOne._buffer_edges_pass.init(gl);
        this.volumeOne.createEdgesE(this.volumeOne.silhouette.edges, this.lightPos, this.extrusionFactor, this.volumeOne._buffer_edges_pass, this.volumeOneEdgeColor);
        this.volumeOne._buffer_edges_fail = new Buffer("objOneEdgesFail");
        this.volumeOne._buffer_edges_fail.init(gl);
        this.volumeOne.createEdges(this.volumeOne.silhouette, this.lightPos, this.volumeOne._buffer_edges_fail, this.volumeOneEdgeColor);


        var objTwo = this.createRhomb(this.objTwoPos,[0.3,0,0.4],[0,0.3,0],[0.3,0,-0.1],new Color(0.2,0.2,1,1));
        this._buffer_objTwo = new Buffer("objTwo")
        this._buffer_objTwo.init(gl);
        this._buffer_objTwo.concat(objTwo, objTwo.length);
        var objTwoWithoutColor = this.removeColor(objTwo);
        this.volumeTwo = new ShadowVolume();
        this.volumeTwo.silhouette = this.volumeTwo.computeSilhouette(objTwoWithoutColor, this.lightPos);
        this.volumeTwo._buffer_quads_pass = new Buffer("objTwoQuadsPass")
        this.volumeTwo._buffer_quads_pass.init(gl);
        this.volumeTwo.createQuadsE(this.volumeTwo.silhouette.edges, this.lightPos, this.extrusionFactor, this.volumeTwo._buffer_quads_pass);
        this.volumeTwo._buffer_quads_fail = new Buffer("objTwoQuadsFail")
        this.volumeTwo._buffer_quads_fail.init(gl);
        this.volumeTwo.createQuads(this.volumeTwo.silhouette, this.lightPos, this.volumeTwo._buffer_quads_fail);
        this.volumeTwo.silhouetteBuffer = this.volumeTwo.edgesToBuffer(this.volumeTwo.silhouette.edges, lineColor);

        this.volumeTwo._buffer_silhouette = new Buffer("objTwoSilhouette");
        this.volumeTwo._buffer_silhouette.init(gl);
        this.volumeTwo._buffer_silhouette.concat(this.volumeTwo.silhouetteBuffer, this.volumeTwo.silhouette.edges.length*14);

        this.volumeTwo._buffer_edges_pass = new Buffer("objTwoEdgesPass");
        this.volumeTwo._buffer_edges_pass.init(gl);
        this.volumeTwo.createEdgesE(this.volumeTwo.silhouette.edges, this.lightPos, this.extrusionFactor, this.volumeTwo._buffer_edges_pass, this.volumeTwoEdgeColor);
        this.volumeTwo._buffer_edges_fail = new Buffer("objTwoEdgesFail");
        this.volumeTwo._buffer_edges_fail.init(gl);
        this.volumeTwo.createEdges(this.volumeTwo.silhouette, this.lightPos, this.volumeTwo._buffer_edges_fail, this.volumeTwoEdgeColor);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        gl.enable(gl.DEPTH_TEST);
        // Accept fragment if it closer to the camera than the former one
        gl.depthFunc(gl.LESS);

        window.document.title = "Shadow Volume";

    };

ShadowVolumeScene.prototype.initPrograms =
    function(gl){
        this._programNormal = Program.createAndCompileProgram(gl, 'normal.vs', 'normal.fs');
        this._programShadow = Program.createAndCompileProgram(gl, 'shadow.vs', 'shadow.fs');
        this._programLine = Program.createAndCompileProgram(gl, 'line.vs', 'line.fs');
        this._programLineFail = Program.createAndCompileProgram(gl, 'lineFail.vs', 'lineFail.fs');
        this._programPass = Program.createAndCompileProgram(gl, 'pass.vs', 'pass.fs');
        this._programFail = Program.createAndCompileProgram(gl, 'fail.vs', 'fail.fs');
    };

ShadowVolumeScene.prototype.initCameras =
    function(gl){
        this._camera = new Camera();
        this._camera.init(this._width, this._height);
        this._view = new OrbitCamera();
        this._camera.setView(this._view);
        this._camera.update(true,true);

        this._failCamera = new Camera();
        this._failCamera.init(this._width, this._height);
        this._failView = new OrbitCamera();
        this._failView.updateProjection =
            function(width, height, camera){
                camera._pmv.glInfinitePerspective(60, width/height, 0.1, null);
        };
        this._failCamera.setView(this._failView);
        this._failCamera.update(true,true);
    };

ShadowVolumeScene.prototype.changeView =
    function(view){
        if(view == 0){
            this._view = new OrbitCamera();
            this._camera.setView(this._view);
            this._camera.update(true,true);

            this._failView = new OrbitCamera();
            this._failView.updateProjection =
                function(width, height, camera){
                    camera._pmv.glInfinitePerspective(60, width/height, 0.1, null);
            };
            this._failCamera.setView(this._failView);
            this._failCamera.update(true,true);

        }
        else {
            this._view = new FreeCamera();
            this._camera.setView(this._view);
            this._camera.update(true,true);

            this._failView = new FreeCamera();
            this._failView.updateProjection =
                function(width, height, camera){
                    camera._pmv.glInfinitePerspective(60, width/height, 0.1, null);
            };
            this._failCamera.setView(this._failView);
            this._failCamera.update(true,true);
        }
    };

ShadowVolumeScene.prototype.changeType =
    function(type){
        if(type === "pass")
            this.type = type;
        else
        if(type === "fail")
            this.type = type;
    };

ShadowVolumeScene.prototype.changeDrawObjects =
    function(draw){
        if(draw === true)
            this.drawObjects = draw;
        else
        if(draw === false)
            this.drawObjects = draw;
    };

ShadowVolumeScene.prototype.changeDrawEdges =
    function(draw){
        if(draw === true)
            this.drawEdges = draw;
        else
        if(draw === false)
            this.drawEdges = draw;
    };

ShadowVolumeScene.prototype.changeEdgesOnTop =
    function(draw){
        if(draw === true)
            this.edgesOnTop = draw;
        else
        if(draw === false)
            this.edgesOnTop = draw;
    };

ShadowVolumeScene.prototype.changeDrawVolume =
    function(draw){
        if(draw === true)
            this.drawVolume = draw;
        else
        if(draw === false)
            this.drawVolume = draw;
    };

ShadowVolumeScene.prototype.changeDrawShadow =
    function(draw){
        if(draw === true)
            this.drawShadow = draw;
        else
        if(draw === false)
            this.drawShadow = draw;
    };

ShadowVolumeScene.prototype.getScreenshot =
    function(callback, size){
        var val = parseInt(size, 10);
        if( val>=0 && val<=4)
            this._screenshotResolution = val;
        this._getScreenshotCallback = callback;
    };

ShadowVolumeScene.prototype._returnScreenshot =
    function(gl){
        console.log("screenshot size: "+this._screenshotResolution*this._width+"x"+this._screenshotResolution*this._height);
        gl.lineWidth(this._screenshotResolution);
        var buf = new Uint8Array(this._width*this._screenshotResolution*this._height*this._screenshotResolution * 4);
        var fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        var rb = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, this._width*this._screenshotResolution, this._height*this._screenshotResolution);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rb);

        var rbd = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, rbd);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this._width*this._screenshotResolution, this._height*this._screenshotResolution);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rbd);


        // render scene
        gl.viewport(0,0,this._width*this._screenshotResolution, this._height*this._screenshotResolution);

        gl.colorMask(true,true,true,true);
        gl.depthMask(true);
        gl.stencilMask(0xFF);
        gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
        gl.clearStencil(0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

        this.renderScene(gl);


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

        gl.lineWidth(1.0);

        var call = this._getScreenshotCallback.bind(window,canvas.toDataURL());
        this._getScreenshotCallback = null;
        setTimeout(call, 50);
    };

ShadowVolumeScene.prototype.getCamera =
    function(){
        return JSON.stringify(this._camera._currentView);
    };

ShadowVolumeScene.prototype.setCamera =
    function(str){
        var view = JSON.parse(str);
        if(view._type === 'orbit'){
            this._view = new OrbitCamera();
            this._view.fromJSON(view);
            this._camera.setView(this._view);
            this._camera.update(true,true);
            this._failView = new OrbitCamera();
            this._failView.fromJSON(view);
            this._failView.updateProjection =
                function(width, height, camera){
                    camera._pmv.glInfinitePerspective(60, width/height, 0.1, null);
            };
            this._failCamera.setView(this._failView);
            this._failCamera.update(true,true);
        } else
        if(view._type === 'free'){
            this._view = new FreeCamera();
            this._view.fromJSON(view);
            this._camera.setView(this._view);
            this._camera.update(true,true);
            this._failView = new FreeCamera();
            this._failView.fromJSON(view);
            this._failView.updateProjection =
                function(width, height, camera){
                    camera._pmv.glInfinitePerspective(60, width/height, 0.1, null);
            };
            this._failCamera.setView(this._failView);
            this._failCamera.update(true,true);
        }
    };



ShadowVolumeScene.prototype.display =
    function(gl) {

        while(this._eventQueue.length>0)
            this.consumeEvent(this._eventQueue.splice(0,1)[0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0,0,this._width,this._height);

        if(this._getScreenshotCallback!=null)
            this._returnScreenshot(gl);

        // reset state
        gl.colorMask(true,true,true,true);
        gl.depthMask(true);
        gl.stencilMask(0xFF);
        gl.clearColor(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearColor.a);
        gl.clearStencil(0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        gl.clear(gl.STENCIL_BUFFER_BIT);

            this.renderScene(gl);
            
    };

ShadowVolumeScene.prototype.renderScene =
    function(gl){

        // render scene normally
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.STENCIL_TEST);
        gl.stencilFunc(gl.NEVER, 0, 0xFF);
        gl.stencilMask(0);
        gl.depthFunc(gl.LESS);
        gl.depthMask(true);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);

            this.renderNormal(gl);

        // render shadow volume

        if(this.type === "pass"){
   
            gl.enable(gl.STENCIL_TEST);
            gl.stencilFunc(gl.ALWAYS, 0 , 0xFF);
            gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.INCR_WRAP);
            gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.DECR_WRAP);
            gl.stencilMask(~0);
            
            if(this.drawVolume === true)
                gl.colorMask(true,true,true,true);
            else
                gl.colorMask(false, false, false, false);
            gl.depthMask(false);

                this.renderZPass(gl);

        } else 
        if(this.type === "fail"){
            
            gl.enable(gl.STENCIL_TEST);
            gl.stencilFunc(gl.ALWAYS, 0 , 0xFF);
            gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP);
            gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP);
            gl.stencilMask(~0);
            
            gl.colorMask(false, false, false, false);
            gl.depthMask(false);
            this.renderZFail(gl);


            // additionally: draw shadow volume faces
            //     rendering only once possible by inverting depthFunc
            //     and switch stencilOp for fail/pass
            if(this.drawVolume === true){
                gl.colorMask(true,true,true,true);
                gl.stencilMask(0);
                gl.depthFunc(gl.GEQUAL);
                this.renderZFail(gl);
            }

        }

        // render shadow/edges
        gl.colorMask(true,true,true,true);
        gl.depthMask(false);
        gl.enable(gl.DEPTH_TEST);

        gl.depthFunc(gl.EQUAL);
        gl.stencilFunc(gl.NOTEQUAL, 0, ~0);
        gl.stencilMask(0)
        gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

        if (this.drawShadow === true)
            this.renderShadow(gl);

        if(this.drawEdges) {
            gl.disable(gl.STENCIL_TEST);
            gl.depthFunc(gl.LESS);
            if(this.edgesOnTop===true)
                gl.disable(gl.DEPTH_TEST);
            this.renderEdges(gl);
            this.renderSilhouette(gl);
        }

    };

// render position+color attribute with x,y,z verticies
ShadowVolumeScene.prototype.renderBuffer =
    function(gl, buffer, positionAttrib, colorAttrib, type){
        if(type === undefined)
            type = gl.TRIANGLES;
        buffer.bind(gl);

        gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, gl.FALSE, 7 * 4, 0);
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, gl.FALSE, 7 * 4, 3 * 4);
        gl.enableVertexAttribArray(colorAttrib);

        buffer.draw(gl, type, 7);

        gl.disableVertexAttribArray(positionAttrib);
        gl.disableVertexAttribArray(colorAttrib);
        buffer.unbind(gl);
    };

// render position+color attribute with x,y,z,w verticies
ShadowVolumeScene.prototype.renderBuffer4 =
    function(gl, buffer, positionAttrib, colorAttrib, type){
        if(type === undefined)
            type = gl.TRIANGLES;
        buffer.bind(gl);

        gl.vertexAttribPointer(positionAttrib, 4, gl.FLOAT, gl.FALSE, 8 * 4, 0);
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, gl.FALSE, 8 * 4, 4 * 4);
        gl.enableVertexAttribArray(colorAttrib);

        buffer.draw(gl, type, 8);

        gl.disableVertexAttribArray(positionAttrib);
        gl.disableVertexAttribArray(colorAttrib);
        buffer.unbind(gl);
    };

// render position attribute with x,y,z verticies
ShadowVolumeScene.prototype.renderBufferPos3 =
    function(gl, buffer, positionAttrib, type){
        if(type === undefined)
            type = gl.TRIANGLES;
        buffer.bind(gl);

        gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(positionAttrib);

        buffer.draw(gl, type, 3);

        gl.disableVertexAttribArray(positionAttrib);
        buffer.unbind(gl);
    };

// render position attribute with x,y,z,w verticies
ShadowVolumeScene.prototype.renderBufferPos4 =
    function(gl, buffer, positionAttrib, type){
        if(type === undefined)
            type = gl.TRIANGLES;
        buffer.bind(gl);

        gl.vertexAttribPointer(positionAttrib, 4, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(positionAttrib);

        buffer.draw(gl, type, 4);

        gl.disableVertexAttribArray(positionAttrib);
        buffer.unbind(gl);
    };

ShadowVolumeScene.prototype.renderZPass =
    function(gl){

        gl.useProgram(this._programPass.getProgramId());

        this._camera.updateUniform(gl, this._programPass.getUniformLocation(gl,'pmvMatrix'));

        var positionAttributeLocation = this._programPass.getAttributeLocation(gl,'vertexPosition');
        
        var colorUniformLocation = this._programPass.getUniformLocation(gl,'vertexColor');
        gl.uniform4fv(colorUniformLocation, this.volumeOneColor);
        this.renderBufferPos3(gl, this.volumeOne._buffer_quads_pass, positionAttributeLocation, gl.TRIANGLES);
        gl.uniform4fv(colorUniformLocation, this.volumeTwoColor);
        this.renderBufferPos3(gl, this.volumeTwo._buffer_quads_pass, positionAttributeLocation, gl.TRIANGLES);

        gl.useProgram(null);
    };

ShadowVolumeScene.prototype.renderZFail =
    function(gl){

        gl.useProgram(this._programFail.getProgramId());

        this._failCamera.updateUniform(gl, this._programFail.getUniformLocation(gl,'pmvMatrix'));

        var positionAttributeLocation = this._programFail.getAttributeLocation(gl,'vertexPosition');
        var colorUniformLocation = this._programFail.getUniformLocation(gl,'vertexColor');

        gl.uniform4fv(colorUniformLocation, this.volumeOneColor);
        this.renderBufferPos4(gl, this.volumeOne._buffer_quads_fail, positionAttributeLocation, gl.TRIANGLES);
        gl.uniform4fv(colorUniformLocation, this.volumeTwoColor);
        this.renderBufferPos4(gl, this.volumeTwo._buffer_quads_fail, positionAttributeLocation, gl.TRIANGLES);

        gl.useProgram(null);
    };

ShadowVolumeScene.prototype.renderShadow =
    function(gl){

        gl.useProgram(this._programShadow.getProgramId());

        if(this.type==="fail")
        this._failCamera.updateUniform(gl, this._programShadow.getUniformLocation(gl,'pmvMatrix'));
        else
        this._camera.updateUniform(gl, this._programShadow.getUniformLocation(gl,'pmvMatrix'));


        var positionAttributeLocation = this._programShadow.getAttributeLocation(gl,'vertexPosition');
        var colorAttributeLocation = this._programShadow.getAttributeLocation(gl,'vertexColor');


        this.renderBuffer(gl, this._buffer_ground, positionAttributeLocation, colorAttributeLocation);

//        this.renderBuffer(gl, this._buffer_light, positionAttributeLocation, colorAttributeLocation);
        if(this.drawObjects === true) {
            this.renderBuffer(gl, this._buffer_objOne, positionAttributeLocation, colorAttributeLocation);
            this.renderBuffer(gl, this._buffer_objTwo, positionAttributeLocation, colorAttributeLocation);
        }

        gl.useProgram(null);
    };

ShadowVolumeScene.prototype.renderNormal =
    function(gl){
        
        gl.useProgram(this._programNormal.getProgramId());

        if(this.type==="fail")
        this._failCamera.updateUniform(gl, this._programNormal.getUniformLocation(gl,'pmvMatrix'));
        else
        this._camera.updateUniform(gl, this._programNormal.getUniformLocation(gl,'pmvMatrix'));

        var positionAttributeLocation = this._programNormal.getAttributeLocation(gl,'vertexPosition');
        var colorAttributeLocation = this._programNormal.getAttributeLocation(gl,'vertexColor');

        this.renderBuffer(gl, this._buffer_ground, positionAttributeLocation, colorAttributeLocation);

        this.renderBuffer(gl, this._buffer_light, positionAttributeLocation, colorAttributeLocation);
        if(this.drawObjects === true) {
            this.renderBuffer(gl, this._buffer_objOne, positionAttributeLocation, colorAttributeLocation);
            this.renderBuffer(gl, this._buffer_objTwo, positionAttributeLocation, colorAttributeLocation);
        }

        gl.useProgram(null);
    };

ShadowVolumeScene.prototype.renderSilhouette =
    function(gl){
        gl.useProgram(this._programLine.getProgramId());

        if(this.type==="fail")
        this._failCamera.updateUniform(gl, this._programLine.getUniformLocation(gl,'pmvMatrix'));
        else
        this._camera.updateUniform(gl, this._programLine.getUniformLocation(gl,'pmvMatrix'));
        var positionAttributeLocation2 = this._programLine.getAttributeLocation(gl,'vertexPosition');
        var colorAttributeLocation2 = this._programLine.getAttributeLocation(gl,'vertexColor');

        //this.renderBuffer(gl, this._buffer_cross, positionAttributeLocation2, colorAttributeLocation2, gl.LINES);
        this.renderBuffer(gl, this.volumeOne._buffer_silhouette, positionAttributeLocation2, colorAttributeLocation2, gl.LINES);
        this.renderBuffer(gl, this.volumeTwo._buffer_silhouette, positionAttributeLocation2, colorAttributeLocation2, gl.LINES);
        gl.useProgram(null);
    };

ShadowVolumeScene.prototype.renderEdges =
    function(gl){

        if(this.type === "fail"){
            var program = this._programLineFail;
            var camera = this._failCamera;
        }
        else {
            var program = this._programLine;
            var camera = this._camera;
        }

        gl.useProgram(program.getProgramId());
        var positionAttributeLocation2 = program.getAttributeLocation(gl,'vertexPosition');
        var colorAttributeLocation2 = program.getAttributeLocation(gl,'vertexColor');
        camera.updateUniform(gl, program.getUniformLocation(gl,'pmvMatrix'));

        if(this.type === "fail"){

            this.renderBuffer4(gl, this.volumeOne._buffer_edges_fail, positionAttributeLocation2, colorAttributeLocation2, gl.LINES);
            this.renderBuffer4(gl, this.volumeTwo._buffer_edges_fail, positionAttributeLocation2, colorAttributeLocation2, gl.LINES);
            
        } else {

            this.renderBuffer(gl, this.volumeOne._buffer_edges_pass, positionAttributeLocation2, colorAttributeLocation2, gl.LINES);
            this.renderBuffer(gl, this.volumeTwo._buffer_edges_pass, positionAttributeLocation2, colorAttributeLocation2, gl.LINES);

        }
        
        gl.useProgram(null);
    };

ShadowVolumeScene.prototype.destroy =
    function(gl) {
        this._programNormal.dispose(gl);
        this._buffer_cube.dispose(gl);
        this._buffer_ground.dispose(gl);
        this._buffer_light.dispose(gl);
    };

ShadowVolumeScene.prototype.reshape =
    function(gl, width, height) {
        BasicScene.prototype.reshape.call(this, gl, width, height);

        this._camera.reshape(gl, width, height);
        this._camera.update(false, true);

        this._failCamera.reshape(gl, width, height);
        this._failCamera.update(false, true);
    };

ShadowVolumeScene.prototype.consumeEvent =
    function(e) {

        this._view.consumeEvent(e, this._camera);
        this._camera.update(true,false);
        this._failView.consumeEvent(e, this._failCamera);
        this._failCamera.update(true,false);

        return false;
    };

ShadowVolumeScene.prototype.removeColor =
    function(buffer){
        var result = new Float32Array((buffer.length/7)*3);
        for(var i=0; i< buffer.length; i+=7){
            result[(i/7)*3] = buffer[i];
            result[(i/7)*3+1] = buffer[i+1];
            result[(i/7)*3+2] = buffer[i+2];
        }
        return result;
    };

ShadowVolumeScene.prototype.createQuad =
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

ShadowVolumeScene.prototype.createRhomb =
    function(mid, ax1,ax2,ax3, color){
        var result = [];
        var ax1m = [1,-1];
        var ax2m = [1,-1];
        var ax3m = [1,-1];
        for(var i=0; i< ax1m.length; i++)
            for(var j=0; j<ax2m.length; j++)
                for(var k=0; k<ax3m.length; k++){
                        var t1 = [mid[0] + ax1[0]*ax1m[i], mid[1] + ax1[1]*ax1m[i], mid[2] + ax1[2]*ax1m[i], color.r, color.g, color.b, color.a];
                        var t2 = [mid[0] + ax2[0]*ax2m[j], mid[1] + ax2[1]*ax2m[j], mid[2] + ax2[2]*ax2m[j], color.r, color.g, color.b, color.a];
                        var t3 = [mid[0] + ax3[0]*ax3m[k], mid[1] + ax3[1]*ax3m[k], mid[2] + ax3[2]*ax3m[k], color.r, color.g, color.b, color.a];
                    result = result.concat(t1);
                    if(ax2m[j]*ax3m[k]*ax1m[i]==-1){
                        result = result.concat(t2);
                        result = result.concat(t3);
                    } else {
                        result = result.concat(t3);
                        result = result.concat(t2);
                    }
                }
        return result;
    };

