var canvas;
var gl;
var programId;

var numAngles = 8;
var stepsPerCurve = 6;
var shape = "profile1";

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var ambientProduct;
var diffuseProduct;
var specularProduct;

// The OpenGL ID of the vertex buffer containing the current shape
var positionBufferId;

// The OpenGL ID of buffers needed for lighting
var normalBufferId;
var texBufferId;
var tex;

var hasTex = false;

// The number of vertices in the current vertex buffer
var vertexCount;

// Binds "on-change" events for the controls on the web page
function initControlEvents() {
    // Use one event handler for all of the shape controls
    document.getElementById("shape-select").onchange = 
    document.getElementById("numAngles").onchange =
    document.getElementById("stepsPerCurve").onchange =
        function(e) {
            shape = document.getElementById("shape-select").value;
            numAngles = parseFloat(document.getElementById("numAngles").value);
            stepsPerCurve = parseFloat(document.getElementById("stepsPerCurve").value);
            
            // Regenerate the vertex data
            vertexCount = buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);
        };
        
    // Event handler for the material control
    document.getElementById("material").onchange = 
        function(e) {
            updateMaterial(getMaterial());
        }
}

// The current view matrix
var viewMatrix;

// Sets up keyboard and mouse events
function initWindowEvents() {
    
    // Whether or not the mouse button is currently being held down for a drag.
    var mousePressed = false;
    
    // Affects how much the camera moves when the mouse is dragged.
    var sensitivity = 0.01;
    
    var theta = 0, phi = 0, radius = 5;
    
    // The place where a mouse drag was started.
    var prevX, prevY;
    
    var grabbedPoint;
    
    canvas.onmousedown = function(e) {
        // A mouse drag started.
        mousePressed = true;
        
        // Remember where the mouse drag started.
        prevX = e.clientX;
        prevY = e.clientY;
    }

    canvas.onmousemove = function(e) {
        if (mousePressed) {
            
            if (e.shiftKey) {
                // Handle light movement here.

                lightPosition[0] += (e.clientX - prevX) * sensitivity;
                lightPosition[1] += (e.clientY - prevY) * sensitivity;


                if (lightPosition[0] < -1) {
                    lightPosition[0] = -1;
                } else if (lightPosition[0] > 1) {
                    lightPosition[0] = 1;
                }
                if (lightPosition[1] < -1) {
                    lightPosition[1] = -1;
                } else if (lightPosition[1] > 1) {
                    lightPosition[1] = 1;
                }

                console.log(lightPosition);

            } else {
            
                // Handle a mouse drag
                theta += (e.clientX - prevX) * sensitivity;
                phi += (e.clientY - prevY) * sensitivity;
                
                if (theta < -2 * Math.PI) {
                    theta += 2 * Math.PI;
                } else if (theta > 2 * Math.PI) {
                    theta -= 2 * Math.PI;
                }
                
                if (phi < -Math.PI / 2) {
                    phi = -Math.PI / 2;
                } else if (phi > Math.PI / 2) {
                    phi = Math.PI / 2;
                }
                
                // Update the model-view matrix.
                gl.useProgram(programId);
                updateModelView(lookAt(
                    vec3(radius * Math.cos(theta) * Math.cos(phi), 
                         radius * Math.sin(phi), 
                         radius * Math.sin(theta) * Math.cos(phi)),
                    vec3(0), vec3(0, 1, 0)));
            }
                
            prevX = e.clientX;
            prevY = e.clientY;
        }
    }

    window.onmouseup = function(e) {
        // A mouse drag ended.
        mousePressed = false;
    }
    
    var speed = 0.1; // Affects how fast the camera "zooms"
    
    window.onkeydown = function(e) {
        
        if (e.keyCode === 190) { // '>' key
            // "Zoom" in
            radius -= speed;
        }
        else if (e.keyCode === 188) { // '<' key
            // "Zoom" out
            radius += speed;
        }
        
        // Update the model-view matrix.
        gl.useProgram(programId);
        updateModelView(lookAt(
            vec3(radius * Math.cos(theta) * Math.cos(phi), 
                 radius * Math.sin(phi), 
                 radius * Math.sin(theta) * Math.cos(phi)),
            vec3(0), vec3(0, 1, 0)));
    }
}

function getControlPoints1() {
    
    var controlPoints = [];
    
    // Initialize control point data
    for (var i = 0; i < 7; i++)
    {
        controlPoints[i] = vec4(0.5, i / 6.0 * 1.6 - 0.8, 0, 1);
    }
    
    return controlPoints;
}

function getControlPoints2() {

    var controlPoints = [];
    controlPoints[0] = vec4(0.1, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.3, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.4, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.45,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.5,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.7,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.9,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints3() {
    
    var controlPoints = [];
    controlPoints[0] = vec4(0.9, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.7, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.5, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.5,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.5,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.7,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.9,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints4() {
    
    var controlPoints = [];
    controlPoints[0] = vec4(0.1, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.5, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.7, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.7,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.7,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.5,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.1,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints5() {
    
    var controlPoints = [];
    controlPoints[0] = vec4(0.1, -1.0, 0.0, 1);
    controlPoints[1] = vec4(0.5, -0.8, 0.0, 1);
    controlPoints[2] = vec4(0.3, -0.4, 0.0, 1);
    controlPoints[3] = vec4(0.2,  0.0, 0.0, 1);
    controlPoints[4] = vec4(0.1,  0.4, 0.0, 1);
    controlPoints[5] = vec4(0.1,  0.8, 0.0, 1);
    controlPoints[6] = vec4(0.1,  1.0, 0.0, 1);
    return controlPoints;
}

function getControlPoints() {
    
    if (shape == "profile1") {
        return getControlPoints1()
    }
    else if (shape == "profile2") {
        return getControlPoints2()
    }
    else if (shape == "profile3") {
        return getControlPoints3()
    }
    else if (shape == "profile4") {
        return getControlPoints4()
    }
    else if (shape == "profile5") {
        return getControlPoints5()
    }
}

function getTVector(vt) {
    // Compute value of each basis function
    var mt = 1.0 - vt;
    return vec4(mt * mt * mt, 3 * vt * mt * mt, 3 * vt * vt * mt, vt * vt * vt);
}

function dotProduct(pnt1, pnt2, pnt3, pnt4, tVal) {
    // Take dot product between each basis function value and the x, y, and z values
    // of the control points
    return vec3(pnt1[0]*tVal[0] + pnt2[0]*tVal[1] + pnt3[0]*tVal[2] + pnt4[0]*tVal[3],
                pnt1[1]*tVal[0] + pnt2[1]*tVal[1] + pnt3[1]*tVal[2] + pnt4[1]*tVal[3],
                pnt1[2]*tVal[0] + pnt2[2]*tVal[1] + pnt3[2]*tVal[2] + pnt4[2]*tVal[3]);
}


// You will want to edit this function to compute the additional attribute data
// for texturing and lighting

function buildSurfaceOfRevolution(controlPoints, angles, steps) {
    if (steps % 2 == 1) {
        steps++;
    }
    
    var dt = 2.0 / steps;
    var da = 360.0 / (angles);
    
    var vertices = [];
    var texCoordArray = [];
    var texAngle = 1.0 / angles;
    var texStepper = 1.0 / steps;
    
    var p = 0;
    for (var i = 0; i < 2; i++)
    {
        var bp1 = controlPoints[i * 3 + 0];
        var bp2 = controlPoints[i * 3 + 1];
        var bp3 = controlPoints[i * 3 + 2];
        var bp4 = controlPoints[i * 3 + 3];
        
        for (var t = 0; t < steps / 2; t++) {
            var p1 = dotProduct(bp1, bp2, bp3, bp4, getTVector(t * dt));
            var p2 = dotProduct(bp1, bp2, bp3, bp4, getTVector((t + 1) * dt));
            
            var savedP = p;
            for (var a = 0; a < angles; a++) {
                vertices[p] = vec3(Math.cos(a * da * Math.PI / 180.0) * p1[0], p1[1],
                                     Math.sin(a * da * Math.PI / 180.0) * p1[0]);

                texCoordArray[p] = vec3(1.0 - (a * texAngle),1.0 - (t * texStepper));

                p++;
                
                vertices[p] = vec3(Math.cos(a * da * Math.PI / 180.0) * p2[0], p2[1],
                                     Math.sin(a * da * Math.PI / 180.0) * p2[0]);

                texCoordArray[p] = vec3(1.0 - (a * texAngle),1.0 - ((t+1) * texStepper));

                p++;
                
                vertices[p] = vec3(Math.cos((a + 1) * da * Math.PI / 180.0) * p1[0], p1[1],
                                     Math.sin((a + 1) * da * Math.PI / 180.0) * p1[0]);

                texCoordArray[p] = vec3(1.0 - ((a+1) * texAngle),1.0 - (t * texStepper));

                p++;
                
                vertices[p] = vec3(Math.cos((a + 1) * da * Math.PI / 180.0) * p1[0], p1[1],
                                     Math.sin((a + 1) * da * Math.PI / 180.0) * p1[0]);

                texCoordArray[p] = vec3(1.0 - ((a+1) * texAngle),1.0 - (t * texStepper));

                p++;
                
                vertices[p] = vec3(Math.cos(a * da * Math.PI / 180.0) * p2[0], p2[1],
                                     Math.sin(a * da * Math.PI / 180.0) * p2[0]);

                texCoordArray[p] = vec3(1.0 - (a * texAngle),1.0 - ((t+1) * texStepper));

                p++;
                
                vertices[p] = vec3(Math.cos((a + 1) * da * Math.PI / 180.0) * p2[0], p2[1],
                                     Math.sin((a + 1) * da * Math.PI / 180.0) * p2[0]);
                texCoordArray[p] = vec3(1.0 - ((a+1) * texAngle),1.0 - ((t+1) * texStepper));
                p++;
            }
        }
    }
    
    var normals = [];
    
    for (var k = 0; k < vertices.length; k+=3) {
        
        var v1 = vertices[k];
        var v2 = vertices[k + 1];
        var v3 = vertices[k + 2];
        
        var vec1 = vec3(v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]);
        var vec2 = vec3(v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]);
        
        var n = normalize(cross(vec1,vec2));

        normals[k] = vec3(n);
        normals[k + 1] = vec3(n);
        normals[k + 2] = vec3(n);
        
        /*var temp1 = Math.abs(dot(n,vec1));
        var temp2 = Math.abs(dot(n,vec2));
        
        if (temp1 > 0.00001 || temp2 > 0.00001) {
            console.log("normal calc wrong");
        }*/
    }
    
    // Pass the new set of vertices to the graphics card
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, texBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordArray), gl.STATIC_DRAW);
    
    return vertices.length;
}

// Render the scene
function viewMethod(vertexCount) {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Use 3D program
    gl.useProgram(programId);
    
    // Associate vertex buffers with vertex attributes
    var vPosition = gl.getAttribLocation(programId, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferId);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    
    //Associate normal buffer with normal attributes
    var vNormal = gl.getAttribLocation(programId, "vNormal");
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferId);
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    var vTexCoord = gl.getAttribLocation(programId, "vTexCoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, texBufferId);
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
    
    // Draw the triangles
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

function render() {
    viewMethod(vertexCount);
}

// The locations of the required GLSL uniform variables.
var locations = {};

// Looks up the locations of uniform variables once.
function findShaderVariables() {
    locations.modelView = gl.getUniformLocation(programId, "ModelView");
    locations.projection = gl.getUniformLocation(programId, "Projection");
    
    //Added by Kadin Schermers
    locations.AmbientProduct = gl.getUniformLocation(programId, "AmbientProduct");
    locations.DiffuseProduct = gl.getUniformLocation(programId, "DiffuseProduct");
    locations.SpecularProduct = gl.getUniformLocation(programId, "SpecularProduct");
    locations.LightPosition = gl.getUniformLocation(programId, "LightPosition");
    locations.Shininess = gl.getUniformLocation(programId, "Shininess");
    locations.hasTex = gl.getUniformLocation(programId, "hasTex");
}

// Pass an updated model-view matrix to the graphics card.
function updateModelView(modelView) {
    gl.uniformMatrix4fv(locations.modelView, false, flatten(modelView));
}

// Pass an updated projection matrix to the graphics card.
function updateProjection(projection) {
    gl.uniformMatrix4fv(locations.projection, false, flatten(projection));
}

// Function for querying the current material
// Returns "plastic", "brass", or "texture"
function getMaterial() {
    return document.getElementById("material").value;
}

function getTexture() {

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(gl.getUniformLocation(programId, "texMap"), 0);
    var imageElement;
    var texSelect = document.getElementById("texture-image").value;
    
    if (texSelect === "tile") {
        imageElement = document.getElementById("tile-img");
        gl.bindTexture(gl.TEXTURE_2D, tex);

    } else if (texSelect === "wood") {
        imageElement = document.getElementById("wood-img");
        gl.bindTexture(gl.TEXTURE_2D, tex);
    }

    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 512, 512, 0, gl.RGB, gl.UNSIGNED_BYTE, imageElement);
    hasTex = true;

    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);



}
 
// Function called when the material changes
// Parameter will be one of "plastic", "brass", or "texture"
function updateMaterial(material) {

    var lightAmbient;
    var lightDiffuse;
    var lightSpecular;
    
    var materialAmbient;
    var materialDiffuse;
    var materialSpecular;
    
    if (material === "plastic") {
        
        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
        lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
        lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        
        materialAmbient = vec4(0.0, 0.0, 0.0, 1.0 );
        materialDiffuse = vec4(0.5, 0.5, 0.0, 1.0);
        materialSpecular = vec4(0.6, 0.6, 0.5, 1.0);
        materialShininess = 32.0;
        
    } else if (material === "brass") {
        
        lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
        lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0 );
        lightSpecular = vec4(1.0, 1.0, 1.0, 1.0 );
        
        materialAmbient = vec4(0.329412, 0.223529, 0.027451,1.0, 1.0);
        materialDiffuse = vec4(0.780392, 0.568627, 0.113725, 1.0);
        materialSpecular = vec4(0.992157, 0.941176, 0.807843, 1.0 );
        materialShininess = 27.8974;
        
    } else if (material == "texture") {
        
        getTexture();
        
    }
    
    ambientProduct = mult(lightAmbient,materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(gl.getUniformLocation(programId, "AmbientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(programId, "DiffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(programId, "SpecularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(programId, "LightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(programId, "Shininess"),materialShininess);
    if (hasTex) {
        gl.uniform1i(gl.getUniformLocation(programId, "hasTex"), 1);
    }
    
}

window.onload = function() {
    
    // Get initial angles and steps
    numAngles = parseFloat(document.getElementById("numAngles").value);
    stepsPerCurve = parseFloat(document.getElementById("stepsPerCurve").value);
    
    // Find the canvas on the page
    canvas = document.getElementById("gl-canvas");
    
    // Initialize a WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { 
        alert("WebGL isn't available"); 
    }
    
    gl.enable(gl.DEPTH_TEST);
    
    // Load shaders
    programId = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(programId);
    
    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    // Create a vertex buffer object for position
    positionBufferId = gl.createBuffer();
    
    // Create buffers needed for programming assignment
    normalBufferId = gl.createBuffer();
    texBufferId = gl.createBuffer();
    tex = gl.createTexture();

    // Enable the shader variable for position for use with a vertex buffer.
    var vPosition = gl.getAttribLocation(programId, "vPosition");
    gl.enableVertexAttribArray(vPosition);
    
    // Find all of the shader uniform variables that we need.
    findShaderVariables();
        
    // Initialize the view matrix
    viewMatrix = lookAt(vec3(0,0,5), vec3(0,0,0), vec3(0,1,0));
    updateModelView(viewMatrix);
    
    // Initialize the projection matrix
    updateProjection(perspective(50, 1.28, 0.01, 100));
    
    //init material
    updateMaterial("plastic");
    
    // Create the surface of revolution
    // (this should load the initial shape into one of the vertex buffer objects you just created)
    vertexCount = buildSurfaceOfRevolution(getControlPoints(), numAngles, stepsPerCurve);
    
    // Set up events for the HTML controls
    initControlEvents();

    // Setup mouse and keyboard input
    initWindowEvents();

    // Start continuous rendering
    window.setInterval(render, 33);
};
