/*
 * EP2 de Computação Gráfica
 * Professor Marcel Parolin Jackowski
 * Aluno Leonardo Haddad Carlos nºUSP 7295361
 */

 function calculateVerticesNormals(verticesList,faceDefinitions) {
    var verticesAdjacentFacesNormals = [];
    var normalsList = [];
    // create empty list of adjacency
    verticesList.forEach(function(vertex){
        verticesAdjacentFacesNormals.push([]);
    });
    // populate adjacency list with indexes of faces adjacent to each vertex
    faceDefinitions.forEach(function(faceDefinition){
        verticesAdjacentFacesNormals[faceDefinition[0][0]].push(faceDefinition[2]);
        verticesAdjacentFacesNormals[faceDefinition[0][1]].push(faceDefinition[2]);
        verticesAdjacentFacesNormals[faceDefinition[0][2]].push(faceDefinition[2]);
    });
    // calculate average of normals of faces adjacent to each vertex to use as vertex normal
    verticesAdjacentFacesNormals.forEach(function(vertexAdjacentFacesNormals){
        var counter = 0;
        var xM = 0;
        var yM = 0;
        var zM = 0;
        vertexAdjacentFacesNormals.forEach(function(vertexAdjacentFaceNormal){
            xM = xM + vertexAdjacentFaceNormal[0];
            yM = yM + vertexAdjacentFaceNormal[1];
            zM = zM + vertexAdjacentFaceNormal[2];
            counter++;
        });
        normalsList.push([xM/counter,yM/counter,zM/counter,0.0]);
    });
    // normals indexes now are equal to vertices indexes (one-to-one)
    var smoothFaceDefinitions = [];
    faceDefinitions.forEach(function(faceDefinition){
        var faceVertex = [];
        faceVertex.push(faceDefinition[0][0]);
        faceVertex.push(faceDefinition[0][1]);
        faceVertex.push(faceDefinition[0][2]);
        var smoothFaceDefinition = [faceVertex,faceVertex];
        smoothFaceDefinitions.push(smoothFaceDefinition);
    });
    return [normalsList,smoothFaceDefinitions];
 }

 function loadObjFile(data) {
    // (i) Parse OBJ file and extract vertices and normal vectors
    var verticesList = [];
    var normalsList = [];
    var faceDefinitions = [];
    var lines = data.split('\n');
    lines.forEach(function(line){
    	if (line.substring(0,2) == "v ") {
    		var vertex = [];
    		var coordinates = line.split(' ');
    		coordinates.forEach(function(coordinate){
    			if (coordinate.substring(0,1) != "v") {
    				vertex.push(parseFloat(coordinate));
    			}
    		});
    		vertex.push(1.0);
    		verticesList.push(vertex);
    	} 
        if (line.substring(0,2) == "vn") {
            var normal = [];
            var axes = line.split(' ');
            axes.forEach(function(axis){
                if (axis.substring(0,1) != "v") {
                    normal.push(parseFloat(axis));
                }
            });
            normal.push(0.0);
            normalsList.push(normal);
        }
        if (line.substring(0,2) == "f ") {
            var faceVertex = [];
            var faceVertexNormal = [];
            var vertices = line.split(' ');
            vertices.forEach(function(vertex){
                if (vertex.substring(0,1) != "f") {
                    var indexes = vertex.split('/');
                    faceVertex.push(parseInt(indexes[0])-1);
                    faceVertexNormal.push(parseInt(indexes[2])-1);
                }
            });
            // triangular faces
            if (faceVertex.length == 3) {
                faceDefinitions.push([faceVertex,faceVertexNormal]);
            }
            // square faces: divide into 2 triangular faces
            else if (faceVertex.length == 4) {
                var firstFaceVertex = [faceVertex[0],faceVertex[1],faceVertex[2]];
                var firstFaceVertexNormal = [faceVertexNormal[0],faceVertexNormal[1],faceVertexNormal[2]];
                var secondFaceVertex = [faceVertex[0],faceVertex[2],faceVertex[3]];
                var secondFaceVertexNormal = [faceVertexNormal[0],faceVertexNormal[2],faceVertexNormal[3]];
                faceDefinitions.push([firstFaceVertex,firstFaceVertexNormal]);
                faceDefinitions.push([secondFaceVertex,secondFaceVertexNormal]);
            }
	    else console.log("This software only supports faces with 3 or 4 vertices!");
        }
    });
    faceDefinitions.forEach(function(faceDefinition){
        var t1 = subtract(verticesList[faceDefinition[0][1]], verticesList[faceDefinition[0][0]]);
        var t2 = subtract(verticesList[faceDefinition[0][2]], verticesList[faceDefinition[0][1]]);
        var faceNormal = vec4(cross(t1, t2), 0);
        faceDefinition.push(faceNormal);
    });
	// (ii) If normal vectors are not in the file, you will need to calculate them
    var calculatedNormalsList = calculateVerticesNormals(verticesList,faceDefinitions);
    var fileHasNormals = true;
    if (normalsList.length == 0 || faceDefinitions[0][1].length == 0 || isNaN(faceDefinitions[0][1][0]))
        fileHasNormals = false;
    // (iii) Return vertices and normals and any associated information you might find useful
	return [verticesList,normalsList,faceDefinitions,calculatedNormalsList[0],calculatedNormalsList[1],fileHasNormals];
}