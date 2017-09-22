/*
 * GLApp
 * Gets OpenGL context, creates scene
 */
function GLApp(webglcanvas, scene, contextParam){
    
this._eventFifo = [];

this._scene = scene;

this._width = 0;

this._height = 0;

this._resized = true;


webglcanvas.width = webglcanvas.clientWidth;
webglcanvas.height = webglcanvas.clientHeight;

if(contextParam === undefined)
    contextParam = {};

this.gl = webglcanvas.getContext('webgl', contextParam);


this._registerListeners();



this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);

this._width = this.gl.drawingBufferWidth;
this._height = this.gl.drawingBufferHeight;

// print OpenGL informations
console.log("GL_VENDOR: "+this.gl.getParameter(this.gl.VENDOR));
console.log("GL_RENDERER: "+this.gl.getParameter(this.gl.RENDERER));
console.log("GL_VERSION: "+this.gl.getParameter(this.gl.VERSION));
console.log("GL_SHADING_LANGUAGE_VERSION: "+this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION));
console.log("Extensions: "+this._ext());
//console.log("canvas client size: "+webglcanvas.clientWidth+"x"+webglcanvas.clientHeight+" buffer size: "+this._width+"x"+this._height);

this._resMan = new Ressource();

this.gl.res = this._resMan;
this._resMan.setCallback(this._start.bind(this));

this._resMan.loadRessources(this._scene.getRessourceList());

this._stop = false;

this._animCallback = this._anim.bind(this);

this._animate = true;

this._disposed = false;

this._updateFrame = false;

this._drawOnlyOnInput = false;

}

GLApp.prototype._anim =
    function(){
        if(!this._stop){
            this.display();
            window.requestAnimFrame(this._animCallback);
        } else {
            this.dispose(this.gl);
        }
    };

GLApp.prototype._start =
    function(){
        if(this._resMan._failedList.length==0){
            this.init(this.gl);
            if(this._animate)
                window.requestAnimFrame(this._animCallback);
            else
                this.display();
        }
    };

GLApp.prototype.updateFrame =
    function(){
        this._updateFrame = true;
    };

GLApp.prototype.drawOnlyOnInput =
    function(bool){
        this._drawOnlyOnInput = bool;
    };

GLApp.prototype.invokeDisplay =
    function(){
        var arr = this.gl.getParameter(this.gl.VIEWPORT);
        console.log("viewport: "+arr[0]+","+arr[1]+","+arr[2]+","+arr[3]);
        console.log("canvas: "+this.gl.canvas.width+"x"+this.gl.canvas.height);
        if(this.gl.isContextLost())
            console.log("context is lost");
        if(!this._animate)
            this.display();
    };

GLApp.prototype._checkForResize =
    function(){
        if(this.gl.canvas.clientWidth != this._width || this.gl.canvas.clientHeight != this._height){
            var width = this.gl.canvas.clientWidth;
            var height = this.gl.canvas.clientHeight;
                this.gl.canvas.width = width;
                this.gl.canvas.height = height;
                this._width = this.gl.drawingBufferWidth;
                this._height = this.gl.drawingBufferHeight;
                this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
                this.gl.scissor(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
                this._resized = true;
        }
    };

GLApp.prototype._genericEventHandler =
    function(eventType,event){

        event.consumed = false;

        if(eventType === "unload"){
            this._stop = true;
            return;
        }
        if(eventType === "resize"){
            var width = this.gl.canvas.clientWidth;
            var height = this.gl.canvas.clientHeight;
            if(this.gl.canvas.width != width || this.gl.canvas.height != height){
                this.gl.canvas.width = width;
                this.gl.canvas.height = height;
                this._width = this.gl.drawingBufferWidth;
                this._height = this.gl.drawingBufferHeight;
                this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
                this.gl.scissor(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
                this._resized = true;
            }
            return;
        }
        this._eventFifo.push(event);
    };


GLApp.prototype.getWidth =
    function(){
        return this._width;
    };

GLApp.prototype.getHeight =
    function(){
        return this._height;
    };

GLApp.prototype.init =
    function(){
        this._scene.init(this._eventFifo, this._width, this._height, this.gl);
    };

GLApp.prototype._ext =
    function(){
        var extList = this.gl.getSupportedExtensions();
        var s = "";
        for(var i=0; i<extList.length; i++)
            s = s + extList[i]+",";
        s = s.substring(0, s.length-1);
        return s;
    };

GLApp.prototype.display =
    function(){

        var draw = false;        

        this._checkForResize();

        var gl = this.gl;

        if(this._stop){
            this.dispose(gl);
            return;
        }


        if(this._resized === true){
            this._resized = false;
            this._scene.reshape(this.gl, this._width, this._height);
            draw = true;
        }

        if(this._eventFifo.length > 0)
            draw = true;
        if(this._updateFrame){
            this._updateFrame = false;
            draw = true;
        }


        if(draw || !this._drawOnlyOnInput){
            this._scene.display(gl);
        }
    };

GLApp.prototype.dispose =
    function(gl){
        if(this._disposed)
            return;
        console.log("dispose of GLApp ressources");
        this._removeListeners();
        this._scene.dispose(gl);
        this._disposed = true;
    };

GLApp.prototype.reshape =
    function(gl, width, height){
        this._scene.reshape(gl, width, height);
    };

GLApp.prototype.getEventFifo =
    function(){
        return this._eventFifo;
    };

GLApp.prototype._tick =
    function (){
        requestAnimFrame(animloop);
        display();
    }

//http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

GLApp.prototype.stop =
    function(){
        this._stop = true;
        return; 
    };

GLApp.prototype._registerListeners =
    function(){
        this._callGenericEventHandler = GLApp.prototype._genericEventHandler.bind(this,"generic");

        this.gl.canvas.addEventListener("mouseover", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("mousewheel", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("wheel", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("mousemove", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("mousedown", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("mouseup", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("mouseout", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("mouseenter", this._callGenericEventHandler, false);
        this.gl.canvas.addEventListener("click", this._callGenericEventHandler, false);
        document.addEventListener("keyup", this._callGenericEventHandler, false);
        document.addEventListener("keydown", this._callGenericEventHandler, false);
        var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
        this.gl.canvas.addEventListener(mousewheelevt, this._callGenericEventHandler, false);
//        this._bindGenericEventHandlerResize = GLApp.prototype._genericEventHandler.bind(this, "resize");
//        window.addEventListener("resize", this._bindGenericEventHandlerResize, false);
        this._bindGenericEventHandlerUnload = GLApp.prototype._genericEventHandler.bind(this, "unload");
        this.gl.canvas.addEventListener("unload", this._bindGenericEventHandlerUnload, false);
        
    };

GLApp.prototype._removeListeners =
    function(){
        this.gl.canvas.removeEventListener("mouseover", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("wheel", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("mousewheel", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("mousemove", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("mousedown", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("mouseup", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("mouseout", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("mouseenter", this._callGenericEventHandler, false);
        this.gl.canvas.removeEventListener("click", this._callGenericEventHandler, false);
        var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x
        this.gl.canvas.removeEventListener(mousewheelevt, this._callGenericEventHandler, false);
        document.removeEventListener("keydown", this._callGenericEventHandler, false);
        document.removeEventListener("keyup", this._callGenericEventHandler, false);
//        window.removeEventListener("resize", this._bindGenericEventHandlerResize, false);
        this.gl.canvas.removeEventListener("unload", this._bindGenericEventHandlerUnload, false);

    };

