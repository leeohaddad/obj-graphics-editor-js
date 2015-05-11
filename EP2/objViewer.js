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
var colorsArray = [];

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

// indexers
var VERTICES_LIST = 0;
var NORMALS_LIST = 1;
var FACE_DEFINITIONS = 2;
var SMOOTH_NORMALS_LIST = 3;
var SMOOTH_FACE_DEFINITIONS = 4;
var FILE_HAS_NORMALS = 5;
var TR_MATRIX = 6;
var TR_NONE = -1;
var TR_SCALE = 0;
var TR_TRANSLATION = 1;
var TR_ROTATION = 2;
var AXIS_NONE = -1;
var AXIS_X = 0;
var AXIS_Y = 1;
var AXIS_Z = 2;
var VERTICES_DEF = 0;
var FILE_NORMALS_DEF = 1;
var CALCULATED_NORMALS_DEF = 2;
var SMOOTH_VERTICES_DEF = 0;
var SMOOTH_NORMALS_DEF = 1;
var KEY_NONE = -1;
var KEY_SHIFT = 16;
var KEY_ESC = 27;
var KEY_DELETE = 46;
var KEY_L = 76;
var KEY_N = 78;
var KEY_R = 82;
var KEY_S = 83;
var KEY_T = 84;
var KEY_X = 88;
var KEY_Y = 89;
var KEY_Z = 90;

// other constants (mouse events)
var MOUSE_NONE = -1;
var MOUSE_LEFT = 0;
var MOUSE_RIGHT = 2;

// my vars
var objectDescriptions = [];
var fileHasNormals;
var shadingModeSelector;
var scaleFactor = 1.0;
var translateFactor = 0.0; //TODO: removeme (from here and from obj.onload)
var loadedObj = false;
var projectionModeSelector;
var perspective_view = true;
var mouse_button_pressed = MOUSE_NONE;
var currentScreenX = undefined;
var currentScreenY = undefined;
var defaultColor = vec4( 0.0,  0.0,  0.0, 1.0 );
var highlightedColor = vec4( 0.0,  1.0,  0.5, 1.0 );
var selectedObject = -1;
var selectedTransformation = TR_NONE;
var selectedAxis = AXIS_NONE;
var pressedKey = KEY_NONE;
var transformationBuffer = mat4();
var filesInput;

// generate a quadrilateral with triangles
function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = vec4(cross(t1, t2), 0);

     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     colorsArray.push(defaultColor); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal);  
     colorsArray.push(defaultColor); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);    
     colorsArray.push(defaultColor); 
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal);  
     colorsArray.push(defaultColor);  
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);  
     colorsArray.push(defaultColor); 
     pointsArray.push(vertices[d]); 
     normalsArray.push(normal);    
     colorsArray.push(defaultColor); 
}

// define faces of a cube
function colorCube()
{
    vertices = applyTransformationTo(rotate(30.0,[1,0,0]),vertices);
    vertices = applyTransformationTo(rotate(30.0,[0,1,0]),vertices);
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

// generate a triangularFace with triangles
function triangularFace(face, color) {
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
     colorsArray.push(color);
     pointsArray.push(bVertex); 
     normalsArray.push(bVertexNormal); 
     colorsArray.push(color);
     pointsArray.push(cVertex); 
     normalsArray.push(cVertexNormal);
     colorsArray.push(color);
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
    else // (window.innerWidth >= window.innerHeight)
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

function setProjectionMode (projectionMode) {
    if (projectionMode.value == "perspective") {
        perspective_view = true;
        cradius = 7.0;
        znear = -1.0;
        zfar = 1.0;
    }
    else if (projectionMode.value == "orthographic") {
        perspective_view = false;
            cradius = 1.0;
            znear = -100.0;
            zfar = 100.0;
    }
    else console.log("Projection mode unknown: " + projectionMode.value + ".");
}

function cameraZoom (factor) {
    if (!perspective_view) {
        console.log("cameraZoom feature is available for perspective view only.");
        return;
    }
    cradius = cradius - factor*cradius/50;
    // not allow camera to fluctuate across objects
    if (cradius < zfar) cradius = zfar;
    //TODO: manipulate near and far to avoid cutting the object out of the view plane.
}

function deleteObject (id) {
    console.log("deleteObject("+id+")");
    objectDescriptions.splice(id,1);
    selectObject(-1);
}

function scaleObject(id, factorX, factorY, factorZ) {
    var currentTransformation = objectDescriptions[id][TR_MATRIX];
    if (factorX==0) return;
    if (factorY==0) return;
    if (factorZ==0) return;
    var scaleMatrix = scale(factorX,factorY,factorZ);
    currentTransformation = mult(scaleMatrix,currentTransformation);
    objectDescriptions[id][TR_MATRIX] = currentTransformation;
    drawObjs();
}

function translateObject(id, factorX, factorY, factorZ) {
    var currentTransformation = objectDescriptions[id][TR_MATRIX];
    var translationMatrix = translate(factorX,factorY,factorZ);
    currentTransformation = mult(translationMatrix,currentTransformation);
    objectDescriptions[id][TR_MATRIX] = currentTransformation;
    drawObjs();
}

//TODO: change logic to world space rotations
function rotateObject(id, factorX, factorY, factorZ) {
    var currentTransformation = objectDescriptions[id][TR_MATRIX];
    if (factorX != 0.0) {
        var rotationMatrixX = rotate(factorX,[1,0,0]);
        currentTransformation = mult(rotationMatrixX,currentTransformation);
    }
    if (factorY != 0.0) {
        var rotationMatrixY = rotate(factorY,[0,1,0]);
        currentTransformation = mult(rotationMatrixY,currentTransformation);
        }
    if (factorZ != 0.0) {
        var rotationMatrixZ = rotate(factorZ,[0,0,1]);
        currentTransformation = mult(rotationMatrixZ,currentTransformation);
    }
    objectDescriptions[id][TR_MATRIX] = currentTransformation;
    drawObjs();
}

function quaternion (angleDegrees, axis) {
    if ( !Array.isArray(axis) ) {
        axis = [arguments[1], arguments[2], arguments[3]];
    }
    halfAngle = radians(angleDegrees * 0.5);
    var q0 = Math.cos(halfAngle);
    var q1 = axis[AXIS_X] * Math.sin(halfAngle);
    var q2 = axis[AXIS_Y] * Math.sin(halfAngle);
    var q3 = axis[AXIS_Z] * Math.sin(halfAngle);
    var s = q0;
    var v = [q1,q2,q3];
    return [s,v];
}

function quaternionRotationMatrix (quaternion) {
    var s = quaternion[0];
    var v = quaternion[1];
    var q0 = s;
    var q1 = v[AXIS_X];
    var q2 = v[AXIS_Y];
    var q3 = v[AXIS_Z];
    var result = mat4(
        vec4( 1-2*q2*q2-2*q3*q3, 2*q1*q2+2*q0*q3,   2*q1*q3-2*q0*q2,   0.0 ),
        vec4( 2*q1*q2-2*q0*q3,   1-2*q1*q1-2*q3*q3, 2*q2*q3+2*q0*q1,   0.0 ),
        vec4( 2*q1*q3+2*q0*q2,   2*q2*q3-2*q0*q1,   1-2*q1*q1-2*q2*q2, 0.0 ),
        vec4()
    );
    return result;
}

function rotateWithQuat (vertices, angle, axis) {
    var q = quaternion(angle,axis);
    var rotationMatrix = quaternionRotationMatrix(q);
    return applyTransformationTo(rotationMatrix,vertices);
}

function onKeyDown (event) {
    if (!loadedObj && event.keyCode!=KEY_L) return;
    if (pressedKey != KEY_NONE && pressedKey != KEY_SHIFT && pressedKey != event.keyCode) return;
    pressedKey = event.keyCode;
}

function onKeyUp (event) {
    if (pressedKey == KEY_NONE || pressedKey != event.keyCode) return;
    if (pressedKey == KEY_N) {
        pressedKey = KEY_NONE;
        toggleObjectSelection();
        return;
    }
    else if (pressedKey == KEY_L) {
        pressedKey = KEY_NONE;
        filesInput.click();
    }
    if (selectedObject == -1) {
        pressedKey = KEY_NONE;
        return;
    }
    if (pressedKey == KEY_S) {
        console.log("Scale Transformation activated.");
        transformationBuffer = objectDescriptions[selectedObject][TR_MATRIX].slice();
        selectedTransformation = TR_SCALE;
        selectedAxis = AXIS_NONE;
    }
    else if (pressedKey == KEY_T) {
        console.log("Translation Transformation activated.");
        transformationBuffer = objectDescriptions[selectedObject][TR_MATRIX].slice();
        selectedTransformation = TR_TRANSLATION;
        selectedAxis = AXIS_NONE;
    }
    else if (pressedKey == KEY_R) {
        console.log("Rotation Transformation activated.");
        transformationBuffer = objectDescriptions[selectedObject][TR_MATRIX].slice();
        selectedTransformation = TR_ROTATION;
        selectedAxis = AXIS_NONE;
    }
    else if (selectedTransformation == TR_NONE) {
        if (pressedKey == KEY_DELETE || pressedKey == KEY_X) deleteObject(selectedObject);
        else if (pressedKey == KEY_ESC) selectObject(-1);
    }
    else if (selectedTransformation == TR_SCALE) {
        if (pressedKey == KEY_X && mouse_button_pressed == MOUSE_NONE) {
            console.log("Scale Transformation configured to axis X.");
            selectedAxis = AXIS_X;
        }
        else if (pressedKey == KEY_Y && mouse_button_pressed == MOUSE_NONE) {
            console.log("Scale Transformation configured to axis Y.");
            selectedAxis = AXIS_Y;
        }
        else if (pressedKey == KEY_Z && mouse_button_pressed == MOUSE_NONE) {
            console.log("Scale Transformation configured to axis Z.");
            selectedAxis = AXIS_Z;
        }
        else if (pressedKey == KEY_ESC) {
            if (mouse_button_pressed == MOUSE_LEFT) {
                console.log("Scale Transformation aborted!");
                objectDescriptions[selectedObject][TR_MATRIX] = transformationBuffer.slice();
            }
            else {
                selectedTransformation = TR_NONE;
                selectedAxis = AXIS_NONE;
                selectObject(-1);
            }
            drawObjs();
        }
    }
    else if (selectedTransformation == TR_TRANSLATION) {
        if (pressedKey == KEY_X && mouse_button_pressed == MOUSE_NONE) {
            console.log("Translation Transformation configured to axis X.");
            selectedAxis = AXIS_X;
        }
        else if (pressedKey == KEY_Y && mouse_button_pressed == MOUSE_NONE) {
            console.log("Translation Transformation configured to axis Y.");
            selectedAxis = AXIS_Y;
        }
        else if (pressedKey == KEY_Z && mouse_button_pressed == MOUSE_NONE) {
            console.log("Translation Transformation configured to axis Z.");
            selectedAxis = AXIS_Z;
        }
        else if (pressedKey == KEY_ESC) {
            if (mouse_button_pressed == MOUSE_LEFT) {
                console.log("Translation Transformation aborted!");
                objectDescriptions[selectedObject][TR_MATRIX] = transformationBuffer.slice();
            }
            else {
                selectedTransformation = TR_NONE;
                selectedAxis = AXIS_NONE;
                selectObject(-1);
            }
            drawObjs();
        }
    }
    else if (selectedTransformation == TR_ROTATION) {
        if (pressedKey == KEY_ESC) {
            if (mouse_button_pressed == MOUSE_LEFT) {
                console.log("Rotation Transformation aborted!");
                objectDescriptions[selectedObject][TR_MATRIX] = transformationBuffer.slice();
            }
            else {
                selectedTransformation = TR_NONE;
                selectedAxis = AXIS_NONE;
                selectObject(-1);
            }
            drawObjs();
        }
    }
    //console.log("onKeyUp("+event.key+").");
    pressedKey = KEY_NONE;
}

function onMouseDown (event) {
    if (mouse_button_pressed != MOUSE_NONE) return;
    mouse_button_pressed = event.button;
}

function onMouseMove (event) {
    if (mouse_button_pressed == MOUSE_RIGHT) {
        if (currentScreenX != undefined && currentScreenY != undefined)
        {
            // camera zoom control
            var deltaScreen = (event.screenX-currentScreenX)+(currentScreenY-event.screenY);
            cameraZoom(deltaScreen);
        }
    }
    else if (mouse_button_pressed == MOUSE_LEFT) {
        if (currentScreenX != undefined && currentScreenY != undefined)
        {
            var deltaScreen = (event.screenX-currentScreenX)+(currentScreenY-event.screenY);
            if (selectedTransformation == TR_NONE) {
                //TODO: rotate camera using quaternions.
            }
            else if (selectedTransformation == TR_SCALE) {
                if (selectedAxis == AXIS_X)
                    scaleObject(selectedObject,1.0+deltaScreen/50,1.0,1.0);
                else if (selectedAxis == AXIS_Y)
                    scaleObject(selectedObject,1.0,1.0+deltaScreen/50,1.0);
                else if (selectedAxis == AXIS_Z)
                    scaleObject(selectedObject,1.0,1.0,1.0+deltaScreen/50);
            }
            else if (selectedTransformation == TR_TRANSLATION) {
                if (selectedAxis == AXIS_X)
                    translateObject(selectedObject,deltaScreen/50,0.0,0.0);
                else if (selectedAxis == AXIS_Y)
                    translateObject(selectedObject,0.0,deltaScreen/50,0.0);
                else if (selectedAxis == AXIS_Z)
                    translateObject(selectedObject,0.0,0.0,deltaScreen/50);
            }
            else if (selectedTransformation == TR_ROTATION) {
                var deltaX = event.screenX-currentScreenX;
                var deltaY = event.screenY-currentScreenY;
                rotateObject(selectedObject,deltaY,deltaX,0.0);
            }
        }
    }
    currentScreenX = event.screenX;
    currentScreenY = event.screenY;
}

function onMouseUp (event) {
    if (mouse_button_pressed == event.button) {
        if (selectedTransformation == TR_SCALE && mouse_button_pressed == MOUSE_LEFT) {
            transformationBuffer = objectDescriptions[selectedObject][TR_MATRIX].slice();
        }
        if (selectedTransformation == TR_TRANSLATION && mouse_button_pressed == MOUSE_LEFT) {
            transformationBuffer = objectDescriptions[selectedObject][TR_MATRIX].slice();
        }
        if (selectedTransformation == TR_ROTATION && mouse_button_pressed == MOUSE_LEFT) {
            transformationBuffer = objectDescriptions[selectedObject][TR_MATRIX].slice();
        }
        mouse_button_pressed = MOUSE_NONE;
    }
}

function selectObject(id) {
    selectedObject = id;
    if (selectedObject >= objectDescriptions.length) selectedObject = -1;
    selectedTransformation = TR_NONE;
    selectedAxis = AXIS_NONE;
    drawObjs();
}

function toggleObjectSelection ()
{
    selectObject(selectedObject+1);
}

function drawObj(parametersArray, color) {
    var verticesList = parametersArray[VERTICES_LIST];
    var normalsList = parametersArray[NORMALS_LIST];
    var faceDefinitions = parametersArray[FACE_DEFINITIONS];
    var smoothNormalsList = parametersArray[SMOOTH_NORMALS_LIST];
    var smoothFaceDefinitions = parametersArray[SMOOTH_FACE_DEFINITIONS];
    if (!loadedObj) pointsArray = [];
    if (!loadedObj) normalsArray = [];
    if (shadingModeSelector.value == "smoothShading")
        smoothFaceDefinitions.forEach(function(smoothFaceDefinition){
            var vertexDefinition = smoothFaceDefinition[0];
            var smoothVertexNormalDefinition = smoothFaceDefinition[SMOOTH_NORMALS_DEF];
            var faceVertices = [verticesList[vertexDefinition[0]],
                                verticesList[vertexDefinition[1]],
                                verticesList[vertexDefinition[2]]];
            var smoothFaceVerticesNormals = [smoothNormalsList[smoothVertexNormalDefinition[0]],
                                             smoothNormalsList[smoothVertexNormalDefinition[1]],
                                             smoothNormalsList[smoothVertexNormalDefinition[2]]];
            triangularFace([faceVertices,smoothFaceVerticesNormals],color);
        });
    else if (shadingModeSelector.value == "flatShading")
        faceDefinitions.forEach(function(faceDefinition){
            var vertexDefinition = faceDefinition[VERTICES_DEF];
            var flatVertexNormal = faceDefinition[CALCULATED_NORMALS_DEF];
            var faceVertices = [verticesList[vertexDefinition[0]],
                                verticesList[vertexDefinition[1]],
                                verticesList[vertexDefinition[2]]];
            var flatFaceVerticesNormals = [flatVertexNormal,flatVertexNormal,flatVertexNormal];
            triangularFace([faceVertices,flatFaceVerticesNormals],color);
        });
    else if (shadingModeSelector.value == "fileNormals")
        faceDefinitions.forEach(function(faceDefinition){
            var vertexDefinition = faceDefinition[VERTICES_DEF];
            var fileVertexNormalDefinition = faceDefinition[FILE_NORMALS_DEF];
            var faceVertices = [verticesList[vertexDefinition[0]],
                                verticesList[vertexDefinition[1]],
                                verticesList[vertexDefinition[2]]];
            var fileFaceVerticesNormals = [normalsList[fileVertexNormalDefinition[0]],
                                           normalsList[fileVertexNormalDefinition[1]],
                                           normalsList[fileVertexNormalDefinition[2]]];
            triangularFace([faceVertices,fileFaceVerticesNormals],color);
        });
    else console.log("Error: shading mode unknown!");
    if (!loadedObj) numVertices = 0;
    numVertices = numVertices + 3 * faceDefinitions.length;
    createBuffers();
    loadedObj = true;
}

function drawObjs() {
    pointsArray = [];
    normalsArray = [];
    colorsArray = [];
    numVertices = 0;
    var objDescription;
    var objTransformationMatrix;
    var objectCounter = 0;
    objectDescriptions.forEach(function(objectDescription){
        var objDescription = objectDescription.slice();
        // apply transformations
        objTransformationMatrix = objectDescription[TR_MATRIX];
        objDescription[VERTICES_LIST] = applyTransformationTo(objTransformationMatrix,objDescription[VERTICES_LIST]);
        // draw object
        if (objectCounter != selectedObject)
            drawObj(objDescription,defaultColor);
        else
            drawObj(objDescription,highlightedColor);
        objectCounter++;
    });
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // events
    document.onkeydown = onKeyDown;
    document.onkeyup = onKeyUp;
    canvas.onmousedown = onMouseDown;
    document.onmousemove = onMouseMove;
    document.onmouseup = onMouseUp;
    
    // disable right click context menu inside canvas
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

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


    projectionModeSelector = document.getElementById("ProjectionMode");
    if (perspective_view)
        projectionModeSelector.value = "perspective";
    else
        projectionModeSelector.value = "orthographic";
    setProjectionMode(projectionModeSelector);

    //document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    //document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    //document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    //document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ButtonS").onclick = function(){toggleObjectSelection()};
    document.getElementById("ProjectionMode").onchange = function(){setProjectionMode(projectionModeSelector)};
    document.getElementById("ShadingMode").onchange = function(){drawObjs()};

    filesInput = document.getElementById('files');
    document.getElementById('files').onchange = function (evt) {
        // load OBJ file and display
        var file = evt.target.files[0];
        if (file) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                document.getElementById("ButtonS").style.visibility="visible";
                shadingModeSelector = document.getElementById("ShadingMode");
                shadingModeSelector.style.visibility="visible";
                var objectDescription = loadObject(e.target.result);

                fileHasNormals = objectDescription[FILE_HAS_NORMALS];
                if (!fileHasNormals) {
                    //TODO: review this logic for multiple objs.
                    shadingModeSelector.removeChild(shadingModeSelector[0]);
                    console.log("File does not have normal vertices!");
                }
                var transformationMatrix = mat4();
                objectDescription.push(transformationMatrix);
                drawObj(objectDescription,defaultColor);
                objectDescriptions.push(objectDescription);
            }
        }
        fileReader.readAsText(file);
        document.getElementById('files').value = "";
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

var render = function() {
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    //if (flag) theta[axis] += 2.0;

    eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi),
               cradius * Math.sin(ctheta) * Math.sin(cphi), 
               cradius * Math.cos(ctheta));

    modelViewMatrix = lookAt(eye, at, up);

    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0] ));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1] ));
    
    if (perspective_view)
        projectionMatrix = perspective(45, canvas.width/canvas.height, znear, zfar);
    else
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
   
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}

function loadObject(data) {

    // convert strings into array of vertex and normal vectors
    var result = loadObjFile(data);
	
    // resize canvas
    resizeCanvas();
    // result[0] = testFitInCanvas(result[0]);

    // apply transformation to the object so that he is centered at the origin
    result[VERTICES_LIST] = moveToCenterOfCanvas(result[VERTICES_LIST]);
    
    return result;
}
