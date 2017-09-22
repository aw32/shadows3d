/*
 * Ressource - manages ressources to be download using ajax or Image class
 * expects arrays containing ressource information
 * executes callback once all downloads were finished
 * data is accessed using getRessource(name) and ressource name defined in array
 */
function Ressource(){

/*
 example for current format:
 this._ressourceList = [
        ["data", "normal.vs", "shadersv/normal.vs"],
        ["data", "normal.fs", "shadersv/normal.fs"],
        [type, name, path]
        ];
 type is "data" or "image"
 name to access ressource after download
 path is ressource url
*/

this._execCallback = true;

this._loadedList = [];

this._loadingList = [];

this._failedList = [];

this._onLoadCallback = function(){};

}

Ressource.prototype.loadImage =
    function(res){
        var ressource = this;
        var img = new Image();
        res[3] = img;
        img.onload = 
            function(){
                ressource._imageLoaded(res);
            };
        img.onerror =
            function(){
                ressource._imageFailed(res);
            };
        this._loadingList.push(res);
        img.src = res[2];
    };

Ressource.prototype.loadImages =
    function(resList){
        for(var res in resList)
            this.loadImage(resList[res]);
    };

Ressource.prototype._imageLoaded =
    function(res){
        //console.log('Loaded image '+res[1]);
        var index = this._loadingList.indexOf(res);
        this._loadingList.splice(index, 1);
        this._loadedList[res[1]] = res;
        this._checkQueue();
    };

Ressource.prototype._imageFailed =
    function(res){
        console.log('Failed to load image '+res[1]);
        var index = this._loadingList.indexOf(res);
        this._loadingList.splice(index, 1);
        this._failedList.push(res);
        this._checkQueue();
    };

Ressource.prototype.loadData =
    function(res){
        var ressource = this;
        this._loadingList.push(res);
        this._loadDataAsync(res[2],
            function(response){
                res[3] = response;
                ressource._dataLoaded(res);
            },
            function(url){
                ressource._dataFailed(res);
            });
        
    };

Ressource.prototype.loadDatas =
    function(dataList){
        for(var res in dataList){
            this.loadData(dataList[res]);
        }
    };

Ressource.prototype.loadRessources =
    function(resList){
        for(var i in resList){
            if(resList[i][0] === 'image')
                this.loadImage(resList[i]);
            else
                this.loadData(resList[i]);
        }
    };

Ressource.prototype._dataLoaded =
    function(res){
        //console.log('Loaded data '+res[1]);
        var index = this._loadingList.indexOf(res);
        this._loadingList.splice(index, 1);
        this._loadedList[res[1]] = res;
        this._checkQueue();
    };

Ressource.prototype._dataFailed =
    function(res){
        console.log('Failed to load data '+res[1]);
        var index = this._loadingList.indexOf(res);
        this._loadingList.splice(index, 1);
        this._failedList.push(res);
        this._checkQueue();
    };

Ressource.prototype._loadDataAsync =
    function(filePath, callback, errorCallback){

        // Set up an asynchronous request
        var request = new XMLHttpRequest();
        request.open('GET', filePath, true);
        request.responseType = "text";
        // Hook the event that gets called as the request progresses
        request.onreadystatechange = function () {
            // If the request is "DONE" (completed or failed)
            if (request.readyState == 4) {
                // If we got HTTP status 200 (OK)
                if (request.status == 200 || request.status == 0) { // 0 for files from local disk
                    callback(request.responseText);
                } else { // Failed
                    alert(request.status);
                    errorCallback(filePath);
                }
            }
        };

        request.send(null);
    };

Ressource.prototype._checkQueue =
    function(){
        if(this._loadingList.length == 0){
            this._onLoadCallback();
        }
    };

Ressource.prototype.setCallback =
    function(callback){
        this._onLoadCallback = callback;
    };

Ressource.prototype.getRessource =
    function(res){
        var resItem = this._loadedList[res];
        var x = resItem[3];
        if(resItem)
            return resItem[3];
    };
