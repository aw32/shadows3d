/*
 * Tools - contains useful methods
 */
Tools = {};

Tools.isKeyEvent =
    function(e){
        return e.type === "keyup" || e.type === "keydown";
    };

Tools.isMouseEvent =
    function(event){
        return event.type === "mouseup" || event.type === "mouseover" || event.type === "mousewheel" || event.type === "mousemove" || event.type === "mousedown"
                || event.type === "mouseout" || event.type === "mouseenter" || event.type === "click";
    };
    
Tools.isTouchEvent =
    function(event){
        return event.type.substring(0,5) === "touch";
    };

// useful to recover serialized typed arrays
Tools.setObjToTypedArray =
    function(obj, arr){
        for(var i = 0; i < arr.length; i++)
            arr[i] = obj[i];
    };
