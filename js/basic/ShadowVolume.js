/*
 * ShadowVolume - contains methods to process shadow volume
 */
function ShadowVolume(){

}

ShadowVolume.prototype.createEdges =
    function(silhouette, lightPos, buffer, color){
        var edges = silhouette.edges;
        if(buffer === undefined)
            buffer = new Buffer("edges");
        var result = buffer;
        for(var i=0; i<edges.length; i++){
            var p1 = [ edges[i].one[0],edges[i].one[1],edges[i].one[2],1];
            var p2 = [ edges[i].two[0],edges[i].two[1],edges[i].two[2],1];
            var p3 = [ edges[i].two[0]-lightPos[0],edges[i].two[1]-lightPos[1],edges[i].two[2]-lightPos[2],0];
            var p4 = [ edges[i].one[0]-lightPos[0],edges[i].one[1]-lightPos[1],edges[i].one[2]-lightPos[2],0];
            
            var quadE = [];
                quadE = quadE.concat(p1);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p2);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p2);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p3);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p3);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p4);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p4);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p1);
                quadE = quadE.concat(color);
            result.concat(quadE,64);
        }
        for(var i=0; i< silhouette.front.length; i++){
            var quadE = [];
            var coord = silhouette.front[i].coord;
            quadE = quadE.concat([coord[0],coord[1],coord[2],1]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[3],coord[4],coord[5],1]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[3],coord[4],coord[5],1]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[6],coord[7],coord[8],1]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[6],coord[7],coord[8],1]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[0],coord[1],coord[2],1]);
                quadE = quadE.concat(color);
            result.concat(quadE,48);
        }
        for(var i=0; i< silhouette.back.length; i++){
            var quadE = [];
            var coord = silhouette.back[i].coord;
            quadE = quadE.concat([coord[0]-lightPos[0],coord[1]-lightPos[1],coord[2]-lightPos[2],0]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[3]-lightPos[0],coord[4]-lightPos[1],coord[5]-lightPos[2],0]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[3]-lightPos[0],coord[4]-lightPos[1],coord[5]-lightPos[2],0]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[6]-lightPos[0],coord[7]-lightPos[1],coord[8]-lightPos[2],0]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[6]-lightPos[0],coord[7]-lightPos[1],coord[8]-lightPos[2],0]);
                quadE = quadE.concat(color);
            quadE = quadE.concat([coord[0]-lightPos[0],coord[1]-lightPos[1],coord[2]-lightPos[2],0]);
                quadE = quadE.concat(color);
            result.concat(quadE,48);
        }

        return result;
    };

// expects list of edge objects, returns  quads(with homogenous coordinates)
ShadowVolume.prototype.createQuads =
    function(silhouette, lightPos, buffer){
        var edges = silhouette.edges;
        if(buffer === undefined)
            buffer = new Buffer("quads");
        var quads = buffer;
        for(var i=0; i<edges.length; i++){
            var cross = new Float32Array(3);
            var edge = [edges[i].two[0]-edges[i].one[0], edges[i].two[1]-edges[i].one[1],
                edges[i].two[2]-edges[i].one[2]];
            var mid = [(edges[i].two[0]+edges[i].one[0])/2,
                    (edges[i].two[1]+edges[i].one[1])/2,
                    (edges[i].two[2]+edges[i].one[2])/2 ];
            var lightDir = [mid[0]-lightPos[0],mid[1]-lightPos[1],mid[2]-lightPos[2]];
            CGMath.crossVec3(edge,edges[i].normal, cross);
            var dot = CGMath.dotVec3(lightDir,cross);
            var p1 = [ edges[i].one[0],edges[i].one[1],edges[i].one[2],1];
            var p2 = [ edges[i].two[0],edges[i].two[1],edges[i].two[2],1];
            var p3 = [ edges[i].two[0]-lightPos[0],edges[i].two[1]-lightPos[1],edges[i].two[2]-lightPos[2],0];
            var p4 = [ edges[i].one[0]-lightPos[0],edges[i].one[1]-lightPos[1],edges[i].one[2]-lightPos[2],0];

            var quad = [];
            if(dot < 0){
                quad = quad.concat(p1);
                quad = quad.concat(p2);
                quad = quad.concat(p3);
                quad = quad.concat(p1);
                quad = quad.concat(p3);
                quad = quad.concat(p4);
            }
            else{
                quad = quad.concat(p1);
                quad = quad.concat(p3);
                quad = quad.concat(p2);
                quad = quad.concat(p1);
                quad = quad.concat(p4);
                quad = quad.concat(p3);
            }
            quads.concat(quad,24);
        }
//        quads.clear();
        for(var i=0; i< silhouette.front.length; i++){
            var quad = [];
            var coord = silhouette.front[i].coord;
            quad = quad.concat([coord[0],coord[1],coord[2],1]);
            quad = quad.concat([coord[3],coord[4],coord[5],1]);
            quad = quad.concat([coord[6],coord[7],coord[8],1]);
            quads.concat(quad,12);
        }
        for(var i=0; i< silhouette.back.length; i++){
            var quad = [];
            var coord = silhouette.back[i].coord;
            quad = quad.concat([coord[0]-lightPos[0],coord[1]-lightPos[1],coord[2]-lightPos[2],0]);
            quad = quad.concat([coord[3]-lightPos[0],coord[4]-lightPos[1],coord[5]-lightPos[2],0]);
            quad = quad.concat([coord[6]-lightPos[0],coord[7]-lightPos[1],coord[8]-lightPos[2],0]);
            quads.concat(quad,12);
        }

        return quads;
    };

ShadowVolume.prototype.createEdgesE =
    function(edges, lightPos, factor, buffer, color){
        var result = buffer;
        for(var i=0; i<edges.length; i++){
            var p1 = [ edges[i].one[0],edges[i].one[1],edges[i].one[2]];
            var p2 = [ edges[i].two[0],edges[i].two[1],edges[i].two[2]];
            var temp_dir = new Float32Array(3);
            CGMath.dirVec3(lightPos,edges[i].two,temp_dir);
            var p3 = [ edges[i].two[0] + temp_dir[0]*factor,
                       edges[i].two[1] + temp_dir[1]*factor,
                       edges[i].two[2] + temp_dir[2]*factor];
            temp_dir.set([0,0,0]);
            CGMath.dirVec3(lightPos,edges[i].one,temp_dir);
            var p4 = [ edges[i].one[0] + temp_dir[0]*factor,
                       edges[i].one[1] + temp_dir[1]*factor,
                       edges[i].one[2] + temp_dir[2]*factor];
            var quadE = [];
                quadE = quadE.concat(p1);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p2);
                quadE = quadE.concat(color);

                quadE = quadE.concat(p2);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p3);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p3);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p4);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p4);
                quadE = quadE.concat(color);
                quadE = quadE.concat(p1);
                quadE = quadE.concat(color);
                
            result.concat(quadE,56);
        }
        return result;
    };

// expects list of edge objects, returns quads(with 3 coords)
ShadowVolume.prototype.createQuadsE =
    function(edges, lightPos, factor, buffer){
        var quads = buffer;
        for(var i=0; i<edges.length; i++){
            var cross = new Float32Array(3);
            var edge = [edges[i].two[0]-edges[i].one[0], edges[i].two[1]-edges[i].one[1],
                edges[i].two[2]-edges[i].one[2]];
            var mid = [(edges[i].two[0]+edges[i].one[0])/2,
                    (edges[i].two[1]+edges[i].one[1])/2,
                    (edges[i].two[2]+edges[i].one[2])/2 ];
            var lightDir = [mid[0]-lightPos[0],mid[1]-lightPos[1],mid[2]-lightPos[2]];
            CGMath.crossVec3(edge,edges[i].normal, cross);
            var dot = CGMath.dotVec3(lightDir,cross);
            var p1 = [ edges[i].one[0],edges[i].one[1],edges[i].one[2]];
            var p2 = [ edges[i].two[0],edges[i].two[1],edges[i].two[2]];
            var temp_dir = new Float32Array(3);
            CGMath.dirVec3(lightPos,edges[i].two,temp_dir);
            var p3 = [ edges[i].two[0] + temp_dir[0]*factor,
                       edges[i].two[1] + temp_dir[1]*factor,
                       edges[i].two[2] + temp_dir[2]*factor];
            temp_dir.set([0,0,0]);
            CGMath.dirVec3(lightPos,edges[i].one,temp_dir);
            var p4 = [ edges[i].one[0] + temp_dir[0]*factor,
                       edges[i].one[1] + temp_dir[1]*factor,
                       edges[i].one[2] + temp_dir[2]*factor];


            var quad = [];
            if(dot < 0){
                quad = quad.concat(p1);
                quad = quad.concat(p2);
                quad = quad.concat(p3);
                quad = quad.concat(p1);
                quad = quad.concat(p3);
                quad = quad.concat(p4);
            }
            else{
                quad = quad.concat(p1);
                quad = quad.concat(p3);
                quad = quad.concat(p2);
                quad = quad.concat(p1);
                quad = quad.concat(p4);
                quad = quad.concat(p3);
            }
            quads.concat(quad,18);
        }
        return quads;
    };

ShadowVolume.prototype._sortEdge =
    function(pointOne,pointTwo){
        var comp = this._comparePoints(pointOne, pointTwo);
        if(comp<=0)
            return {"one":pointOne,"two":pointTwo,"order":"normal"};
        else
            return {"one":pointTwo,"two":pointOne,"order":"reversed"};
    };

ShadowVolume.prototype._comparePoints =
    function(pointOne, pointTwo){
        if(pointOne[0]<pointTwo[0])
            return -1;
        else
        if(pointTwo[0]<pointOne[0])
            return 1;
        else
            if(pointOne[1]<pointTwo[1])
                return -1;
            else
            if(pointTwo[1]<pointOne[1])
                return 1;
            else
                if(pointOne[2]<pointTwo[2])
                return -1;
                else
                if(pointTwo[2]<pointOne[2])
                    return 1;
                else
                    return 0;
    };

// expects triangles in buffer
ShadowVolume.prototype.computeSilhouette =
    function(buffer,lightPos) {
        var trilist = [];
        // create triangle arrays (3 points per array)
        for(var i=0; i<buffer.length; i+=9){
            trilist.push({"coord":[buffer[i],buffer[i+1],buffer[i+2],
                buffer[i+3],buffer[i+4],buffer[i+5],
                buffer[i+6],buffer[i+7],buffer[i+8]]});
        }
        // compute dot product between triangle and light
        for(var i=0; i<trilist.length; i+=1){
            trilist[i].normal = this._computeNormal(trilist[i].coord);
            trilist[i].mid = [
                (trilist[i].coord[0]+trilist[i].coord[3]+trilist[i].coord[6])/3,
                (trilist[i].coord[1]+trilist[i].coord[4]+trilist[i].coord[7])/3,
                (trilist[i].coord[2]+trilist[i].coord[5]+trilist[i].coord[8])/3 ];
            var lightDir = [
                trilist[i].mid[0]-lightPos[0],
                trilist[i].mid[1]-lightPos[1],
                trilist[i].mid[2]-lightPos[2]  ];
            trilist[i].dot = CGMath.dotVec3(lightDir,trilist[i].normal);
        }
        // create EdgeList for each triangle
        for(var i=0; i<trilist.length; i+=1){
            var coord = trilist[i].coord;
            var edgeList = [this._sortEdge([coord[0],coord[1],coord[2]],[coord[3],coord[4],coord[5]]),
                this._sortEdge([coord[3],coord[4],coord[5]],[coord[6],coord[7],coord[8]]),
                this._sortEdge([coord[6],coord[7],coord[8]],[coord[0],coord[1],coord[2]])
            ];
            trilist[i].edgeList = edgeList;
        };
        var triOne = null;
        var triTwo = null;
        var edges = [];
        // for every triangle search for identical edges
        for(var i=0; i<trilist.length-1; i++){
            triOne = trilist[i];
            for(var j=i+1; j<trilist.length; j++){
                triTwo = trilist[j];
                // check for dot product
                if(triOne.dot < 0 && triTwo.dot >0 || triOne.dot>0 && triTwo.dot<0 || triOne.dot ==  0 && triTwo.dot >0 || triOne.dot >0 && triTwo.dot == 0){
                    // check for identical edges
                    var edgeList = this._identEdges(triOne, triTwo);
                    if(edgeList.length > 0){
                        for(var k=0; k< edgeList.length; k++)
                            edgeList[k].normal = [triOne.normal[0]+triTwo.normal[0],triOne.normal[1]+triTwo.normal[2],triOne.normal[2]+triTwo.normal[2]];
                        edges = edges.concat(edgeList);
                    }
                }
            }
        }
        // copy all front/back facing triangles into separate array
        var front = [];
        var back = [];
        for(var i=0; i<trilist.length; i++)
            if(trilist[i].dot <= 0 )
                front.push(trilist[i]);
            else
                back.push(trilist[i]);
        // return silhouette, front facing, back facing triangles!!
        return {"edges":edges,"front":front,"back":back};
    };

ShadowVolume.prototype._identEdges =
    function(one, two){
        // identify common edges of both triangles
        var oneList = one.edgeList;
        var twoList = two.edgeList;
        var commonEdgeList = [];
        for(var i=0; i<oneList.length; i++)
            for(var j=0; j<twoList.length; j++){
                if(this._comparePoints(oneList[i].one, twoList[j].one)==0 && this._comparePoints(oneList[i].two, twoList[j].two)==0)
                    commonEdgeList.push(oneList[i]);
            }
        return commonEdgeList;
    };

ShadowVolume.prototype._computeNormal =
    function(points){
        var cross = new Float32Array(3);
        CGMath.crossVec3([points[3]-points[0],points[4]-points[1],points[5]-points[2]],[points[6]-points[3],points[7]-points[4],points[8]-points[5]],cross);
        return cross;
    };

ShadowVolume.prototype.edgesToBuffer =
    function(edges, lineColor){
        var silhouetteBuffer = [];
        for(var i=0; i<edges.length; i++){
            var edge = edges[i];
            silhouetteBuffer[i*14] = edge.one[0];
            silhouetteBuffer[i*14+1] = edge.one[1];
            silhouetteBuffer[i*14+2] = edge.one[2];
            silhouetteBuffer[i*14+3] = lineColor[0];
            silhouetteBuffer[i*14+4] = lineColor[1];
            silhouetteBuffer[i*14+5] = lineColor[2];
            silhouetteBuffer[i*14+6] = lineColor[3];
            silhouetteBuffer[i*14+7] = edge.two[0];
            silhouetteBuffer[i*14+8] = edge.two[1];
            silhouetteBuffer[i*14+9] = edge.two[2];
            silhouetteBuffer[i*14+10] = lineColor[0];
            silhouetteBuffer[i*14+11] = lineColor[1];
            silhouetteBuffer[i*14+12] = lineColor[2];
            silhouetteBuffer[i*14+13] = lineColor[3];
        }
        return silhouetteBuffer;
    };
