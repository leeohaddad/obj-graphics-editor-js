/*
 * EP2 de Computação Gráfica
 * Professor Marcel Parolin Jackowski
 * Aluno Leonardo Haddad Carlos nºUSP 7295361
 */

var program;
var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4( 10.0, 10.0, 10.0, 0.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

// transformation and projection matrices
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

//var ctm;
var ambientColor, diffuseColor, specularColor;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 1;
var theta =[0, 0, 0];

var thetaLoc;

// camera definitions
var eye = vec3(1.0, 0.0, 0.0);
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var cradius = 1.0;
var ctheta = 0.0;
var cphi = 0.0;

// our universe
var xleft = -1.0;
var xright = 1.0;
var ybottom = -1.0;
var ytop = 1.0;
var znear = -100.0;
var zfar = 100.0;

var flag = true;

var objectDescriptions = [];
var fileHasNormals;
var shadingModeSelector;
var scaleFactor = 1.0;
var loadedObj = false;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = vec4(cross(t1, t2), 0);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
}

// define faces of a cube
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

// generate a quadrilateral with triangles
function triangularFace(face) {
     var faceVertices = face[0];
     var faceVerticesNormals = face[1];
     var aVertex = faceVertices[0];
     var bVertex = faceVertices[1];
     var cVertex = faceVertices[2];
     var aVertexNormal = faceVerticesNormals[0];
     var bVertexNormal = faceVerticesNormals[1];
     var cVertexNormal = faceVerticesNormals[2];

     pointsArray.push(aVertex); 
     normalsArray.push(aVertexNormal); 
     pointsArray.push(bVertex); 
     normalsArray.push(bVertexNormal); 
     pointsArray.push(cVertex); 
     normalsArray.push(cVertexNormal);
}

// apply the transformation described by transformationMatrix into the object verticesList
function applyTransformationTo(transformationMatrix, verticesList) {
    var newVerticesList = [];
    verticesList.forEach(function(vertex){
        newVerticesList.push(mult(transformationMatrix,vertex));
    });
    return newVerticesList;
}

// simulate giant object to test fitInCanvas function
function testFitInCanvas(verticesList) {
    var scaleFactor = 3;
    var scaleMatrix = scale(scaleFactor,scaleFactor,scaleFactor);
    return applyTransformationTo(scaleMatrix,verticesList);
}

// receive a list of vertices representing an object and scale to make it fit in canvas
function ensureFitInCanvas(verticesList) {
    var xMin = undefined; var xMax = undefined;
    var yMin = undefined; var yMax = undefined;
    var scaleMatrix;
    scaleFactor = 1;
    verticesList.forEach(function(vertex){
        var x=vertex[0], y=vertex[1], z=[vertex[2]];
        if (xMin == undefined || x < xMin) xMin = x;
        if (xMax == undefined || x > xMax) xMax = x;
        if (yMin == undefined || y < yMin) yMin = y;
        if (yMax == undefined || y > yMax) yMax = y;
    });
    if (xMin < -1) {
        scaleFactor = -1/xMin;
    }
    if (yMin < -1 && (-1/yMin) < scaleFactor) {
        scaleFactor = -1/yMin;
    }
    if (xMax > 1 && 1/xMax < scaleFactor) {
        scaleFactor = 1/xMax;
    }
    if (yMax > 1 && 1/yMax < scaleFactor) {
        scaleFactor = 1/yMax;
    }
    scaleMatrix = scale(scaleFactor,scaleFactor,scaleFactor);
    return applyTransformationTo(scaleMatrix,verticesList);
}

function resizeCanvas() {
    var newSize = canvas.width;
    if (window.innerWidth > window.innerHeight)
    {
        newSize = window.innerWidth;
    }
    else // if (window.innerWidth >= window.innerHeight)
    {
        newSize = window.innerHeight;
    }
    canvas.width = newSize;
    canvas.height = newSize;
    gl.viewport( 0, 0, canvas.width, canvas.height );
}

function resize() {
    resizeCanvas();
    createBuffers();
}

// receive a list of vertices representing an object and translate to the center of the canvas
function moveToCenterOfCanvas(verticesList) {
    var xMin = undefined; var xMax = undefined;
    var yMin = undefined; var yMax = undefined;
    verticesList.forEach(function(vertex){
        var x=vertex[0], y=vertex[1], z=[vertex[2]];
        if (xMin == undefined || x < xMin) xMin = x;
        if (xMax == undefined || x > xMax) xMax = x;
        if (yMin == undefined || y < yMin) yMin = y;
        if (yMax == undefined || y > yMax) yMax = y;
    });
    if (xMin < -1 || yMin < -1 || xMax > 1 || yMax > 1) {
        verticesList = ensureFitInCanvas(verticesList);
        xMin = xMin * scaleFactor;
        xMax = xMax * scaleFactor;
        yMin = yMin * scaleFactor;
        yMax = yMax * scaleFactor;
    }
    var xOffset = -(xMin+xMax)/2;
    var yOffset = -(yMin+yMax)/2;
    var translateMatrix = translate(xOffset,yOffset,0);
    return applyTransformationTo(translateMatrix,verticesList);
}

function toggleShading() {
    objectDescriptions.forEach(function(objectDescription){
        drawObj(objectDescription);
    });
}

function drawObj(parametersArray) {
    console.log("MyBool: " + loadedObj);
    var verticesList = parametersArray[0];
    var normalsList = parametersArray[1];
    var faceDefinitions = parametersArray[2];
    var smoothNormalsList = parametersArray[3];
    var smoothFaceDefinitions = parametersArray[4];
    if (!loadedObj) pointsArray = [];
    if (!loadedObj) normalsArray = [];
    if (shadingModeSelector.value == "smoothShading")
        smoothFaceDefinitions.forEach(function(smoothFaceDefinition){
            var vertexDefinition = smoothFaceDefinition[0];
            var smoothVertexNormalDefinition = smoothFaceDefinition[1];
            var faceVertices = [verticesList[vertexDefinition[0]],
                                verticesList[vertexDefinition[1]],
                                verticesList[vertexDefinition[2]]];
            var smoothFaceVerticesNormals = [smoothNormalsList[smoothVertexNormalDefinition[0]],
                                             smoothNormalsList[smoothVertexNormalDefinition[1]],
                                             smoothNormalsList[smoothVertexNormalDefinition[2]]];
            triangularFace([faceVertices,smoothFaceVerticesNormals]);
        });
    else if (shadingModeSelector.value == "flatShading")
        faceDefinitions.forEach(function(faceDefinition){
            var vertexDefinition = faceDefinition[0];
            var flatVertexNormal = faceDefinition[2];
            var faceVertices = [verticesList[vertexDefinition[0]],
                                verticesList[vertexDefinition[1]],
                                verticesList[vertexDefinition[2]]];
            var flatFaceVerticesNormals = [flatVertexNormal,flatVertexNormal,flatVertexNormal];
            triangularFace([faceVertices,flatFaceVerticesNormals]);
        });
    else if (shadingModeSelector.value == "fileNormals")
        faceDefinitions.forEach(function(faceDefinition){
            var vertexDefinition = faceDefinition[0];
            var fileVertexNormalDefinition = faceDefinition[1];
            var faceVertices = [verticesList[vertexDefinition[0]],
                                verticesList[vertexDefinition[1]],
                                verticesList[vertexDefinition[2]]];
            var fileFaceVerticesNormals = [normalsList[fileVertexNormalDefinition[0]],
                                           normalsList[fileVertexNormalDefinition[1]],
                                           normalsList[fileVertexNormalDefinition[2]]];
            triangularFace([faceVertices,fileFaceVerticesNormals]);
        });
    else console.log("Error: shading mode unknown!");
    if (!loadedObj) numVertices = 0;
    numVertices = numVertices + 3 * faceDefinitions.length;
    createBuffers();
    loadedObj = true;
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // create viewport and clear color
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    // enable depth testing for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // draw simple cube for starters
    colorCube();
    
    // create vertex and normal buffers
    createBuffers();

    thetaLoc = gl.getUniformLocation(program, "theta"); 

    // create light components
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    // create model view and projection matrices
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ShadingMode").onchange = function(){toggleShading()};

    document.getElementById('files').onchange = function (evt) {
        // load OBJ file and display
        var file = evt.target.files[0];
        if (file) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                shadingModeSelector = document.getElementById( "ShadingMode" );
                shadingModeSelector.style.visibility="visible";
                var objectDescription = loadObject(e.target.result);
                fileHasNormals = objectDescription[5];
                if (!fileHasNormals) {
                    //TODO: review this logic for multiple objs.
                    shadingModeSelector.removeChild(shadingModeSelector[0]);
                    console.log("File does not have normal vertices!");
                }
                drawObj(objectDescription);
                objectDescriptions.push(objectDescription);
            }
        }
        fileReader.readAsText(file);
    };

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    resizeCanvas();
    render();
}
var doit = true;
var render = function() {
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    //if (flag) theta[axis] += 2.0;
    if (doit) theta[xAxis] += 12.0;
    if (doit) theta[yAxis] += 12.0;
    if (doit) theta[zAxis] += 12.0;
    doit = false;

    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);
              

    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    
    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
    requestAnimFrame(render);
}

function createBuffers(points, normals) {

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

function loadObject(data) {

    // convert strings into array of vertex and normal vectors
    var result = loadObjFile(data);
	
    // resize canvas
    resizeCanvas();
    // result[0] = testFitInCanvas(result[0]);

    // apply transformation to the object so that he is centered at the origin
    result[0] = moveToCenterOfCanvas(result[0]);
    
    return result;
}
